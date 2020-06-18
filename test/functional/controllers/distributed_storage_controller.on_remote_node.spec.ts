import {suite, test, timeout} from 'mocha-typescript';
import {Bootstrap, Config, Container, DistributedStorageEntityController, Injector, Log, XS_P_$COUNT} from '@typexs/base';
import {
  API_DISTRIBUTED_STORAGE_DELETE_ENTITY,
  API_DISTRIBUTED_STORAGE_FIND_ENTITY,
  API_DISTRIBUTED_STORAGE_GET_ENTITY,
  API_DISTRIBUTED_STORAGE_SAVE_ENTITY,
  API_DISTRIBUTED_STORAGE_UPDATE_ENTITIES_BY_CONDITION,
  API_DISTRIBUTED_STORAGE_UPDATE_ENTITY,
  API_STORAGE_DELETE_ENTITIES_BY_CONDITION,
  K_ROUTE_CONTROLLER
} from '../../../src/libs/Constants';
import {expect} from 'chai';
import {WebServer} from '../../../src';
import * as _ from 'lodash';
import {SpawnHandle} from '../SpawnHandle';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
import {IEventBusConfiguration} from 'commons-eventbus';
import {HttpFactory, IHttp} from 'commons-http';
import {DistributedRandomData} from './fake_app_node/entities/DistributedRandomData';
import {RandomData} from './fake_app_storage/entities/RandomData';

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

  async before() {
    // delete + create dummy data
    await Injector.get(DistributedStorageEntityController)
      .remove(DistributedRandomData,
        {id: {$gt: 10}});
  }


  @test
  async 'create single plain entity'() {
    const d = new DistributedRandomData();
    d.numValue = 1234;
    d.short = 'hallo';
    d.long = 'welt '.repeat(50);
    d.date = new Date();
    d.bool = true;
    d.boolNeg = false;
    d.floatValue = 0.34;

    // save one driver
    let res: any = await http.post(URL + '/api' +

      API_DISTRIBUTED_STORAGE_SAVE_ENTITY
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name)),
      {
        body: d,
        json: true
      }
    );

    expect(res).to.not.be.null;
    res = res.body;

    expect(res).to.have.length(1);
    expect(res).to.have.length(1);
    // correct string date
    res[0].date = new Date(res[0].date);
    expect(res[0]['__remoteIds__']).to.be.deep.eq({
      'fake_app_node': {
        'id': 11
      }
    });
    expect(res[0]).to.be.deep.include(d);

    const found = await Injector.get(DistributedStorageEntityController)
      .findOne(DistributedRandomData, {id: 11});

    expect(found).to.be.deep.include(d);

  }

  @test
  async 'create single plain entity; throw error on  not existing nodeId'() {
    try {
      const res: any = await http.post(URL + '/api' +

        API_DISTRIBUTED_STORAGE_SAVE_ENTITY
          .replace(':nodeId', 'fake_app_node_not')
          .replace(':name', _.snakeCase(DistributedRandomData.name)),
        {
          body: {},
          json: true
        }
      );
      expect(true).to.be.false;
    } catch (e) {
      expect(e.body).to.deep.eq({
        status: 500,
        context: 'distributed_storage.save',
        message: 'no distributed worker found to execute the query.',
        data: []
      });
    }
  }


  @test
  async 'create multiple plain entity'() {
// save one driver
    const d1 = new RandomData();
    d1.numValue = 1234;
    d1.short = 'hallo';
    d1.long = 'welt '.repeat(50);
    d1.date = new Date();
    d1.bool = true;
    d1.boolNeg = false;
    d1.floatValue = 0.34;

    // save one driver
    const d2 = new RandomData();
    d2.numValue = 45634;
    d2.short = 'ballo';
    d2.long = 'ding '.repeat(12);
    d2.date = new Date();
    d2.bool = false;
    d2.boolNeg = true;
    d2.floatValue = 0.48;

    // save multiple driver
    let res: any = await http.post(URL + '/api' +

      API_DISTRIBUTED_STORAGE_SAVE_ENTITY
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name)),
      {
        body: [d1, d2],
        json: true
      }
    );

    expect(res).to.not.be.null;
    res = res.body;

    expect(res).to.have.length(2);
    // correct string date
    res.map((x: any) => x.date = new Date(x.date));
    expect(res[0]).to.be.deep.include(d1);
    expect(res[1]).to.be.deep.include(d2);

    const found = await Injector.get(DistributedStorageEntityController)
      .find(DistributedRandomData,
        {id: {$in: res.map((x: any) => x['__remoteIds__']['fake_app_node'].id)}});
    expect(found).to.have.length(2);
    expect(found[0]).to.be.deep.include(d1);
    expect(found[1]).to.be.deep.include(d2);

  }

  @test
  async 'get single entity (by numeric id)'() {
    let res = await http.get(URL + '/api' +

      API_DISTRIBUTED_STORAGE_GET_ENTITY
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name))
        .replace(':id', '1'), {json: true}
    );

    expect(res).to.not.be.null;
    res = res.body;

    expect(res).to.deep.eq({
      '$label': '1',
      '$url': '/distributed/entity/fake_app_node/distributed_random_data/1',
      '__class__': 'DistributedRandomData',
      '__nodeId__': 'fake_app_node',
      '__registry__': 'typeorm',
      'bool': false,
      'boolNeg': false,
      'date': '2020-02-01T23:00:00.000Z',
      'floatValue': 0.893,
      'id': 1,
      'long': 'long long long very long long long long very long long long long very long long long long very long long long long very long ',
      'numValue': 100,
      'short': 'short name 1'
    });
    expect(res).to.have.include.keys(['$url', '$label']);
  }


  @test
  async 'get multiple entities (by numeric id)'() {
    let res: any = await http.get(URL + '/api' +

      API_DISTRIBUTED_STORAGE_GET_ENTITY
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name))
        .replace(':id', '1,2'), {json: true}
    );

    expect(res).to.not.be.null;
    res = res.body as any;
    expect(res.$count).to.be.eq(2);
    expect(res.entities).to.have.length(2);
    expect(res.entities[0]).to.deep.eq({
      '$label': '1',
      '$url': '/distributed/entity/fake_app_node/distributed_random_data/1',
      '__class__': 'DistributedRandomData',
      '__nodeId__': 'fake_app_node',
      '__registry__': 'typeorm',
      'bool': false,
      'boolNeg': false,
      'date': '2020-02-01T23:00:00.000Z',
      'floatValue': 0.893,
      'id': 1,
      'long': 'long long long very long long long long very long long long long very long long long long very long long long long very long ',
      'numValue': 100,
      'short': 'short name 1'
    });
    expect(res.entities[1]).to.deep.eq({
      '$label': '2',
      '$url': '/distributed/entity/fake_app_node/distributed_random_data/2',
      '__class__': 'DistributedRandomData',
      '__nodeId__': 'fake_app_node',
      '__registry__': 'typeorm',
      'bool': true,
      'boolNeg': false,
      'date': '2020-03-03T23:00:00.000Z',
      'floatValue': 1.786,
      'id': 2,
      'long': 'long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long ',
      'numValue': 200,
      'short': 'short name 2'
    });
  }

  @test.skip
  async 'get multiple entities (by string id)'() {

  }

  @test
  async 'find entities'() {
    const _url = (URL + '/api' + API_DISTRIBUTED_STORAGE_FIND_ENTITY).replace(':name', DistributedRandomData.name);
    const res: any = await http.get(_url, {json: true, passBody: true});
    expect(res).to.not.be.null;
    expect(res.entities).to.have.length(10);
    expect(res.entities.map((x: any) => x.id)).to.deep.eq(_.range(1, 11));
  }


  @test
  async 'find entities by conditions'() {
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


  @test
  async 'find entities (by date)'() {
    const date = new Date('2020-06-09T22:00:00.000Z');
    const _url = (URL + '/api' + API_DISTRIBUTED_STORAGE_FIND_ENTITY)
      .replace(':name', DistributedRandomData.name);
    let res: any = null;
    res = await http.get(
      _url + '?query=' +
      JSON.stringify({date: {$gt: date}}),
      {json: true, passBody: true});

    expect(res).to.not.be.null;
    expect(res).to.not.be.null;
    expect(res[XS_P_$COUNT]).to.be.eq(5);
    expect(res.entities).to.have.length(5);
    // console.log(res.entities);
    expect(res.entities[0]).to.deep.include({
      bool: true,
      boolNeg: false,
      id: 6,
      short: 'short name 6',
      long:
        'long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long long long long very long ',
      numValue: 600,
      floatValue: 5.3580000000000005,
      date: '2020-07-11T22:00:00.000Z',
      __class__: 'DistributedRandomData',
      __registry__: 'typeorm',
      __nodeId__: 'fake_app_node',
      '$url':
        '/distributed/entity/fake_app_node/distributed_random_data/6',
      '$label': '6'
    });

  }

  @test
  async 'aggregate entities'() {
    let res = await http.get(URL + '/api' +

      API_DISTRIBUTED_STORAGE_FIND_ENTITY
        .replace(':name', DistributedRandomData.name) + '?aggr=' +
      JSON.stringify([
        {$match: {floatValue: {$gt: 2}}},
        {$group: {_id: '$bool', sum: {$sum: '$floatValue'}}},
      ]), {json: true}
    ) as any;

    expect(res).to.not.be.null;
    res = res.body;
    expect(res.entities).to.have.length(2);
    expect(res.entities[0]).to.be.deep.eq({
      'bool': 0,
      'sum': 21.432000000000002,
      '__nodeId__': 'fake_app_node'
    });
    expect(res.entities[1]).to.be.deep.eq({
      'bool': 1,
      'sum': 25.003999999999998,
      '__nodeId__': 'fake_app_node'
    });

  }


  @test
  async 'update entity by id'() {
    const controller = Injector.get(DistributedStorageEntityController);
    const d2 = new DistributedRandomData();
    d2.numValue = 56341;
    d2.short = 'ballo welt';
    d2.long = 'ding '.repeat(5);
    d2.date = new Date();
    d2.bool = false;
    d2.boolNeg = true;
    d2.floatValue = 0.68;
    const dataSaved = (await controller
      .save(d2, {targetIds: ['fake_app_node']})) as any;

    d2.long = 'this is an update';

    const id = d2['__remoteIds__']['fake_app_node'].id;
    d2.id = id;
    let res = await http.post(URL + '/api' +

      API_DISTRIBUTED_STORAGE_UPDATE_ENTITY
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name))
        .replace(':id', id), {body: d2, json: true}
    ) as any;

    expect(res).to.not.be.null;
    res = res.body;

    console.log(res);
    expect(res).to.have.length(1);
    expect(res[0]).to.be.deep.include({
      bool: false,
      boolNeg: true,
      short: 'ballo welt',
      long: 'this is an update',
      numValue: 56341,
      floatValue: 0.68,
      date: d2.date.toISOString(),
      __distributedId__: 0,
      __remoteIds__: {fake_app_node: {id: id}}
    });

    const afterUpdate = await controller.find(DistributedRandomData,
      {id: id});
    expect(afterUpdate).to.have.length(1);
    for (const entry of afterUpdate) {
      expect(entry).to.deep.include({
        numValue: 56341,
        long: 'this is an update'
      });
    }
  }

  @test
  async 'update entity by condition'() {
    const d = new Date();
    const controller = Injector.get(DistributedStorageEntityController);
    const entries = [];
    for (let i = 101; i < 111; i++) {
      const randomData = new DistributedRandomData();
      randomData.id = i;
      randomData.numValue = i * 100;
      randomData.floatValue = i * 0.893;
      randomData.bool = i % 2 === 0;
      randomData.date = new Date(d.getFullYear(), i, i * 2, 0, 0, 0);
      randomData.short = 'short name ' + i;
      randomData.long = 'test update';
      entries.push(randomData);
    }
    const saved = await controller.save(entries, {targetIds: ['fake_app_node']});
    expect(saved).to.have.length(10);

    // save multiple driver
    let res: any = await http.put(URL + '/api' +

      API_DISTRIBUTED_STORAGE_UPDATE_ENTITIES_BY_CONDITION
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name))
      +
      '?query=' + JSON.stringify({$and: [{id: {$gte: 100}}, {id: {$lte: 110}}]}),
      <any>{
        body: {
          $set: {
            numValue: 123,
            long: 'this is an update'
          }
        },
        json: true
      }
    );
    expect(res).to.not.be.null;
    res = res.body;

    // sqlite does not support node
    expect(res).to.be.deep.eq({fake_app_node: -2});

    const afterUpdate = await controller.find(DistributedRandomData,
      {$and: [{id: {$gte: 100}}, {id: {$lte: 110}}]});
    expect(afterUpdate).to.have.length(10);
    for (const entry of afterUpdate) {
      expect(entry).to.deep.include({
        numValue: 123,
        long: 'this is an update'
      });
    }

    const notUpdated = await controller
      .find(DistributedRandomData, {id: {$lte: 10}});
    expect(notUpdated).to.have.length(10);
    for (const entry of notUpdated) {
      expect(entry).to.not.deep.include({
        numValue: 123,
        long: 'this is an update'
      });
    }
  }

  @test
  async 'delete entity by id'() {
    const controller = Injector.get(DistributedStorageEntityController);
    const d = new Date();
    const entries = [];
    for (let i = 101; i < 111; i++) {
      const randomData = new DistributedRandomData();
      randomData.id = i;
      randomData.numValue = i * 100;
      randomData.floatValue = i * 0.893;
      randomData.bool = i % 2 === 0;
      randomData.date = new Date(d.getFullYear(), i, i * 2, 0, 0, 0);
      randomData.short = 'short name ' + i;
      randomData.long = 'test delete';
      entries.push(randomData);
    }
    const saved = await controller.save(entries);
    expect(saved).to.have.length(10);

    // delete by one id
    let res = await http.delete(URL + '/api' +

      API_DISTRIBUTED_STORAGE_DELETE_ENTITY
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name))
        .replace(':id', '101'), {json: true}
    );
    expect(res).to.not.be.null;
    res = res.body;
    expect(res).to.be.deep.eq({fake_app_node: 1});
    let found = await controller.find(DistributedRandomData, {id: 101});
    expect(found).to.have.length(1);

    // delete by multiple id
    res = await http.delete(URL + '/api' +

      API_DISTRIBUTED_STORAGE_DELETE_ENTITY
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name))
        .replace(':id', '102,103,104'), {json: true}
    );
    expect(res).to.not.be.null;
    res = res.body;
    found = await controller.find(DistributedRandomData,
      {id: {$in: [102, 103, 104]}});
    expect(found).to.have.length(3);

    found = await controller.find(DistributedRandomData,
      {id: {$in: [101, 102, 103, 104]}}, {targetIds: ['fake_app_node']});
    expect(found).to.have.length(0);

  }

  @test
  async 'delete entity by condition'() {
    const controller = Injector.get(DistributedStorageEntityController);
    const d = new Date();
    const entries = [];
    for (let i = 101; i < 111; i++) {
      const randomData = new DistributedRandomData();
      randomData.id = i;
      randomData.numValue = i * 100;
      randomData.floatValue = i * 0.893;
      randomData.bool = i % 2 === 0;
      randomData.date = new Date(d.getFullYear(), i, i * 2, 0, 0, 0);
      randomData.short = 'short name ' + i;
      randomData.long = 'test delete';
      entries.push(randomData);
    }
    const saved = await controller.save(entries);
    expect(saved).to.have.length(10);

    // delete by one id
    let res = await http.delete(URL + '/api' +

      API_STORAGE_DELETE_ENTITIES_BY_CONDITION
        .replace(':nodeId', 'fake_app_node')
        .replace(':name', _.snakeCase(DistributedRandomData.name)) +
      '?query=' + JSON.stringify(
        {$and: [{long: 'test delete'}, {id: {$gte: 105}}]}),
      {json: true}
    );
    expect(res).to.not.be.null;
    res = res.body;
    // expect(res).to.be.deep.eq({fake_app_node: -2});

    const afterDelete = await controller
      .find(DistributedRandomData,
        {$and: [{id: {$gte: 100}}, {id: {$lte: 110}}]});
    expect(afterDelete).to.have.length(14);

    const afterDeleteOnNode = await controller
      .find(DistributedRandomData,
        {$and: [{id: {$gte: 100}}, {id: {$lte: 110}}]},
        {targetIds: ['fake_app_node']});
    expect(afterDeleteOnNode).to.have.length(0);

    const notDeleted = await controller
      .find(DistributedRandomData, {id: {$lte: 10}});
    expect(notDeleted).to.have.length(10);
  }

}
