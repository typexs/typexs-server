import {suite, test, timeout} from 'mocha-typescript';
import {Bootstrap, Config, Container, IRuntimeLoaderOptions, ITypexsOptions} from '@typexs/base';
import {
  API_STORAGE_DELETE_ENTITY,
  API_STORAGE_FIND_ENTITY,
  API_STORAGE_GET_ENTITY,
  API_STORAGE_METADATA_ALL_ENTITIES,
  API_STORAGE_METADATA_ALL_STORES,
  API_STORAGE_METADATA_GET_ENTITY,
  API_STORAGE_METADATA_GET_STORE,
  API_STORAGE_PREFIX,
  API_STORAGE_SAVE_ENTITY,
  API_STORAGE_UPDATE_ENTITY,
  K_ROUTE_CONTROLLER
} from '../../../src/libs/Constants';
import {expect} from 'chai';
import {Server} from '../../../src';
import * as _ from 'lodash';
import {Driver} from './fake_app_storage/entities/Driver';
import {TEST_STORAGE_OPTIONS} from '../config';
import {HttpFactory, IHttp} from 'commons-http';


const settingsTemplate: ITypexsOptions & any = {
  storage: {
    default: TEST_STORAGE_OPTIONS
  },

  app: {name: 'demo', path: __dirname + '/fake_app_storage'},

  modules: <IRuntimeLoaderOptions>{
    paths: [__dirname + '/../../../']
  },

  logging: {
    enable: false,
    level: 'debug',
    transports: [{console: {}}],
  },

  server: {
    default: {
      type: 'web',
      framework: 'express',
      host: 'localhost',
      port: 4500,

      routes: [{
        type: K_ROUTE_CONTROLLER,
        context: 'api',
        routePrefix: 'api'
      }]
    }
  }

};

let bootstrap: Bootstrap = null;
let server: Server = null;
let request: IHttp = null;


@suite('functional/controllers/storage_api_controller')
@timeout(300000)
// tslint:disable-next-line:class-name
class Storage_api_controllerSpec {


  static async before() {
    const settings = _.clone(settingsTemplate);
    request = HttpFactory.create();

    bootstrap = Bootstrap
      .setConfigSources([{type: 'system'}])
      .configure(settings)
      .activateErrorHandling()
      .activateLogger();

    await bootstrap.prepareRuntime();
    await bootstrap.activateStorage();
    await bootstrap.startup();

    server = Container.get('server.default');
    await server.start();
  }


  async before() {
    // delete + create dummy data

  }


  static async after() {
    if (server) {
      await server.stop();
    }
    await bootstrap.shutdown();
    Bootstrap.reset();
    Container.reset();
    Config.clear();
  }


  @test
  async 'list storages'() {
    const url = server.url();
    let res: any = await request.get(url + '/api' + API_STORAGE_PREFIX + API_STORAGE_METADATA_ALL_STORES, {json: true});
    // console.log(inspect(res, false, 10));
    expect(res).to.not.be.null;
    res = res.body;
    expect(res).to.have.length(1);
    expect(res[0].entities).to.have.length(4);
    expect(_.map(res[0].entities, e => e.name)).to.contain.members(['Driver', 'Car']);
    const driver = _.find(res[0].entities, e => e.name === 'Driver');
    expect(driver.properties).to.have.length(4);
    expect(_.map(driver.properties, e => e.name)).to.be.deep.eq(['id', 'firstName', 'lastName', 'car']);


  }

  @test
  async 'list storage default'() {
    const url = server.url();
    let res: any = await request.get(url + '/api' + API_STORAGE_PREFIX +
      API_STORAGE_METADATA_GET_STORE.replace(':name', 'default'), {json: true});
    // console.log(inspect(res, false, 10));
    expect(res).to.not.be.null;
    res = res.body;
    expect(res).to.exist;
    expect(res.name).to.be.eq('default');
    expect(res.entities).to.have.length(4);
    expect(_.map(res.entities, e => e.name)).to.contain.members(['Driver', 'Car']);
    const driver = _.find(res.entities, e => e.name === 'Driver');
    expect(driver.properties).to.have.length(4);
    expect(_.map(driver.properties, e => e.name)).to.be.deep.eq(['id', 'firstName', 'lastName', 'car']);


  }

  @test
  async 'list all entities'() {
    const url = server.url();
    let res = await request.get(url + '/api' + API_STORAGE_PREFIX +
      API_STORAGE_METADATA_ALL_ENTITIES, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res).to.have.length(4);
    expect(_.map(res, r => r.options.storage)).to.contain.members(['default']);
    expect(_.map(res, e => e.name)).to.contain.members(['Driver', 'Car']);
    const driver = _.find(res, e => e.name === 'Driver');
    expect(driver.properties).to.have.length(4);
    expect(_.map(driver.properties, e => e.name)).to.be.deep.eq(['id', 'firstName', 'lastName', 'car']);
  }

  @test
  async 'list entity'() {
    const url = server.url();
    let res: any = await request.get(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_METADATA_GET_ENTITY.replace(':name', 'driver'), {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res).to.exist;
    expect(res.storage).to.be.eq('default');
    expect(res.name).to.be.eq('Driver');
    expect(res.properties).to.have.length(4);
    expect(_.map(res.properties, e => e.name)).to.be.deep.eq(['id', 'firstName', 'lastName', 'car']);

  }

  @test.skip
  async 'create entity class'() {

  }

  @test.skip
  async 'create entity'() {

  }

  @test.skip
  async 'find entity'() {

  }

  @test.skip
  async 'update entity by id'() {

  }

  @test.skip
  async 'update entity by condition'() {

  }

  @test.skip
  async 'delete entity by id'() {

  }

  @test.skip
  async 'delete entity by condition'() {

  }

  @test.skip
  async 'aggregate entities'() {

  }


  @test
  async 'lifecycle of entity create, get, find, update, remove'() {
    const url = server.url();

    const d = new Driver();
    d.lastName = 'Yellow';
    d.firstName = 'Blue';

    // save one driver
    let res: any = await request.post(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_SAVE_ENTITY.replace(':name', 'driver'),
      {
        body: d,
        json: true
      }
    );

    expect(res).to.not.be.null;
    res = res.body;

    expect(res.id).to.be.gt(0);
    expect(res).to.be.deep.include(d);
    expect(res.$state).to.be.deep.include({isValidated: true, isSuccessValidated: true});

    const d2 = new Driver();
    d2.lastName = 'Gray';
    d2.firstName = 'Green';

    const d3 = new Driver();
    d3.lastName = 'Red';
    d3.firstName = 'Dark';

    // save multiple driver
    res = await request.post(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_SAVE_ENTITY.replace(':name', 'driver'),
      {
        body: [d2, d3],
        json: true
      }
    );

    expect(res).to.not.be.null;
    res = res.body;

    expect(res).to.have.length(2);
    expect(res[0]).to.be.deep.include(d2);
    expect(res[1]).to.be.deep.include(d3);
    expect(res[0].$state).to.be.deep.include({isValidated: true, isSuccessValidated: true});

    // get single driver
    res = await request.get(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_GET_ENTITY.replace(':name', 'driver').replace(':id', res[0].id), {json: true}
    );

    expect(res).to.not.be.null;
    res = res.body;

    expect(res).to.deep.include(d2);
    expect(res).to.have.include.keys(['$url', '$label']);


    // update single driver
    res.lastName = 'Gray2';
    res = await request.post(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_UPDATE_ENTITY.replace(':name', 'driver').replace(':id', res.id), {body: res, json: true}
    );

    expect(res).to.not.be.null;
    res = res.body;
    expect(res.lastName).to.be.eq('Gray2');

    // get multiple driver
    res = await request.get(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_GET_ENTITY.replace(':name', 'driver').replace(':id', '1,2,3'), {json: true}
    );

    expect(res).to.not.be.null;
    res = res.body;
    expect(res.entities).to.have.length(3);
    expect(res.$count).to.eq(3);


    res = await request.get(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_FIND_ENTITY.replace(':name', 'driver') + '?query=' + JSON.stringify({firstName: 'Blue'}), {json: true}
    );

    expect(res).to.not.be.null;
    res = res.body;
    expect(res.$count).to.be.eq(1);
    expect(res.entities).to.have.length(1);
    expect(res.entities[0].firstName).to.be.eq('Blue');

    res = await request.delete(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_DELETE_ENTITY.replace(':name', 'driver').replace(':id', '1,2'), {json: true}
    );

    expect(res).to.not.be.null;
    res = res.body;

    expect(res).to.eq(2);

    res = await request.get(url + '/api' +
      API_STORAGE_PREFIX +
      API_STORAGE_GET_ENTITY.replace(':name', 'driver').replace(':id', '1,2'), {json: true}
    );
    expect(res).to.not.be.null;
    res = res.body;
    expect(res.$count).to.be.eq(0);

  }

}
