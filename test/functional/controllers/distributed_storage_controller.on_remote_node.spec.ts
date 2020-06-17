import {suite, test, timeout} from 'mocha-typescript';
import {Bootstrap, Config, Container, Log, XS_P_$COUNT} from '@typexs/base';
import {API_DISTRIBUTED_STORAGE_FIND_ENTITY, K_ROUTE_CONTROLLER} from '../../../src/libs/Constants';
import {expect} from 'chai';
import {WebServer} from '../../../src';
import * as _ from 'lodash';
import {SpawnHandle} from '../SpawnHandle';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
import {IEventBusConfiguration} from 'commons-eventbus';
import {HttpFactory, IHttp} from 'commons-http';
import {DistributedRandomData} from './fake_app_node/entities/DistributedRandomData';

const LOG_EVENT = TestHelper.logEnable(false);
const carList = [
  'Volvo', 'Renault', 'Ford', 'Suzuki', 'BMW', 'VW',
  'GM', 'Audi', 'Mercedes', 'Tesla', 'Aston Martin'
];
const settingsTemplate: any = {
  storage: {
    default: TEST_STORAGE_OPTIONS
  },

  app: {name: 'demo', path: __dirname + '/../../..', nodeId: 'server'},

  modules: {
    paths: [
      __dirname + '/fake_app_node'
    ]
  },
  logging: {
    enable: LOG_EVENT,
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
  },
  workers: {access: [{name: 'DistributedQueryWorker', access: 'allow'}]},
  eventbus: {default: <IEventBusConfiguration>{adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}}},

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;
let http: IHttp = null;
let URL: string = null;
let p: SpawnHandle = null;

@suite('functional/controllers/distributed_storage_controller (on remote node)') @timeout(60000)
class DistributedStorageControllerSpec {


  static async before() {
    http = HttpFactory.create();
    const settings = _.clone(settingsTemplate);


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

    URL = server.url();
    p = SpawnHandle.do(__dirname + '/fake_app_node/node_distributed.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(100);

  }

  static async after() {
    if (server) {
      await server.stop();
    }
    await bootstrap.shutdown();

    p.shutdown();
    await p.done;
    Bootstrap.reset();
    Container.reset();
    Config.clear();
  }


  @test
  async 'distributed query'() {

    const _url = (URL + '/api' + API_DISTRIBUTED_STORAGE_FIND_ENTITY).replace(':name', DistributedRandomData.name);
    console.log(_url);
    const res: any = await http.get(_url, {json: true, passBody: true});


    expect(res).to.not.be.null;
    expect(res.entities).to.have.length(10);
    expect(res.entities.map((x: any) => x.id)).to.deep.eq(_.range(1, 11));
  }


  @test
  async 'distributed query with conditions'() {
    const _url = (URL + '/api' + API_DISTRIBUTED_STORAGE_FIND_ENTITY).replace(':name', DistributedRandomData.name);
    let res: any = null;
    try {
      res = await http.get(_url + '?query=' + JSON.stringify({short: 'short name 1'}), {json: true, passBody: true});
    } catch (err) {
      Log.error(err);
    }

    expect(res).to.not.be.null;
    expect(res).to.not.be.null;
    expect(res[XS_P_$COUNT]).to.be.eq(1);
    expect(res.entities).to.have.length(1);
    expect(res.entities[0]).to.deep.include({
      'bool': false,
      'boolNeg': false,
      'id': 1,
      'short': 'short name 1',
      'long': 'long long long very long long long long very long long long long very long long long long very long long long long very long ',
      'numValue': 100,
      'floatValue': 0.893,
      'date': '2020-02-01T23:00:00.000Z',
      '__class__': 'DistributedRandomData',
      '__registry__': 'typeorm',
      '__nodeId__': 'fake_app_node',
      '$url': '/distributed/entity/fake_app_node/distributed_random_data/1',
      '$label': '1'
    });
  }

}
