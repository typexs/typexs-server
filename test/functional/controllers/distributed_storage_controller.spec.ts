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

const LOG_EVENT = TestHelper.logEnable(false);

const settingsTemplate: any = {
  storage: {
    default: TEST_STORAGE_OPTIONS
  },

  app: {name: 'demo', path: __dirname + '/../../..', nodeId: 'server'},

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

@suite('functional/controllers/distributed_storage_controller') @timeout(300000)
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
  async 'distributed query'() {
    const url = server.url();
    const p = SpawnHandle.do(__dirname + '/fake_app_node/node_distributed.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);


    const _url = (url + API_DISTRIBUTED_STORAGE_FIND_ENTITY).replace(':name', 'system_node_info');
    const start = Date.now();
    const res: any = await http.get(_url, {json: true});

    p.shutdown();

    await p.done;

    expect(res).to.not.be.null;
    expect(res.body).to.not.be.null;
    expect(res.body.entities).to.have.length(4);
    expect(res.body.entities.map((x: any) => x.nodeId)).to.contain.members(['fake_app_node', 'server']);
  }


  @test
  async 'distributed query with conditions'() {
    const url = server.url();
    const p = SpawnHandle.do(__dirname + '/fake_app_node/node_distributed.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);

    const _url = (url + API_DISTRIBUTED_STORAGE_FIND_ENTITY).replace(':name', 'system_node_info');
    let res: any = null;
    try {
      res = await http.get(_url + '?query=' + JSON.stringify({nodeId: 'server'}), {json: true});
    } catch (err) {
      Log.error(err);
    }

    p.shutdown();
    await p.done;

    expect(res).to.not.be.null;
    expect(res.body).to.not.be.null;
    expect(res.body[XS_P_$COUNT]).to.be.eq(2);
    expect(res.body.entities).to.have.length(2);
    expect(res.body.entities.map((x: any) => x.nodeId)).to.contain.members(['server']);
    expect(res.body.entities.map((x: any) => x.nodeId)).to.not.contain.members(['fake_app_node']);
  }

}
