import {suite, test, timeout} from '@testdeck/mocha';
import {Bootstrap, Config, Injector} from '@typexs/base';
import {
  API_CTRL_SYSTEM_MODULES,
  API_CTRL_SYSTEM_RUNTIME_INFO,
  API_CTRL_SYSTEM_RUNTIME_NODE,
  API_CTRL_SYSTEM_RUNTIME_NODES, API_CTRL_SYSTEM_STORAGES,
  API_CTRL_SYSTEM_WORKERS,
  C_API,
  K_ROUTE_CONTROLLER
} from '../../../src/libs/Constants';
import {expect} from 'chai';

import * as _ from 'lodash';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
import {HttpFactory, IHttp} from 'commons-http';
import {WebServer} from '../../../src/libs/web/WebServer';


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
  }

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;
let http: IHttp = null;

@suite('functional/controllers/runtime_info_controller') @timeout(300000)
class RuntimeInfoControllerSpec {


  static async before() {
    const settings = _.clone(settingsTemplate);
    http = HttpFactory.create();

    bootstrap = Bootstrap
      .setConfigSources([{type: 'system'}])
      .configure(settings)
      .activateErrorHandling()
      .activateLogger();

    await bootstrap.prepareRuntime();
    await bootstrap.activateStorage();
    await bootstrap.startup();

    server = Injector.get('server.default');
    await server.start();
  }

  static async after() {
    if (server) {
      await server.stop();
    }
    await bootstrap.shutdown();
    Bootstrap.reset();
    Injector.reset();
    Config.clear();
  }


  @test
  async 'get info'() {
    const url = server.url() + '/' + C_API;
    let res: any = await http.get(url + API_CTRL_SYSTEM_RUNTIME_INFO, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res.networks).to.not.be.null;
    expect(_.keys(res.networks)).to.have.length.gt(0);
    expect(res.cpus).to.not.be.null;
    expect(res.cpus).to.have.length.gt(0);
    expect(res.uptime).to.be.gt(0);
  }


  @test
  async 'get node'() {
    const url = server.url() + '/' + C_API;
    let res: any = await http.get(url + API_CTRL_SYSTEM_RUNTIME_NODE, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res.hostname).to.not.be.null;
  }

  @test
  async 'get nodes'() {
    // empty
    const url = server.url() + '/' + C_API;
    let res = await http.get(url + API_CTRL_SYSTEM_RUNTIME_NODES, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res).to.have.length(0);
  }


  @test
  async 'list workers'() {
    const url = server.url() + '/' + C_API;
    let res: any = await http.get(url + API_CTRL_SYSTEM_WORKERS, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res.hostname).to.not.be.null;
  }




  @test @timeout(300000)
  async 'list modules'() {
    const url = server.url() + '/' + C_API;
    let res = await http.get(url + API_CTRL_SYSTEM_MODULES, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(_.map(res, r => r.name)).to.deep.include.members([
      '@typexs/server', '@typexs/base']);
  }


  @test @timeout(300000)
  async 'list storages'() {
    const url = server.url() + '/' + C_API;
    let res: any = await http.get(url + API_CTRL_SYSTEM_STORAGES, {json: true});
    expect(res.body).to.not.be.null;
    res = res.body;
    expect(res).to.have.length(1);
    res = res.shift();
    const compare = _.clone(settingsTemplate);
    compare.storage.default.name = 'default';
    // compare.storage.default.entities = [];
    expect(res).to.have.deep.include(compare.storage.default);
  }


}
