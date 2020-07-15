import {suite, test, timeout} from 'mocha-typescript';
import {Bootstrap, Config, Injector} from '@typexs/base';
import {API_CTRL_SERVER_PING, API_CTRL_SERVER_STATUS, C_API, K_ROUTE_CONTROLLER} from '../../../src/libs/Constants';
import {expect} from 'chai';
import {WebServer} from '../../../src';
import * as _ from 'lodash';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
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
  }

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;
let http: IHttp = null;

@suite('functional/controllers/server_status_controller') @timeout(300000)
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
  async 'ping'() {
    const url = server.url() + '/' + C_API;
    let res: any = await http.get(url + API_CTRL_SERVER_PING, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res.time).to.not.be.null;
    expect(new Date(res.time)).to.be.lte(new Date());
  }


  @test
  async 'status'() {
    const url = server.url() + '/' + C_API;
    let res: any = await http.get(url + API_CTRL_SERVER_STATUS, {json: true});
    expect(res).to.not.be.null;
    res = res.body;
    expect(res.time).to.not.be.null;
    expect(new Date(res.time)).to.be.lte(new Date());
  }


}
