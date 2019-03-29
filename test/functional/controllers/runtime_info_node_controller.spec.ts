import {suite, test, timeout} from "mocha-typescript";
import {Bootstrap, Config, Container} from "@typexs/base";
import {API_SYSTEM_RUNTIME_NODES, K_ROUTE_CONTROLLER} from "../../../src/libs/Constants";
import * as request from "request-promise";
import {expect} from "chai";
import {WebServer} from "../../../src";
import * as _ from "lodash";
import {SpawnHandle} from "../SpawnHandle";
import {TestHelper} from "../TestHelper";
import {TEST_STORAGE_OPTIONS} from "../config";
import {IEventBusConfiguration} from "commons-eventbus";

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
  eventbus: {default: <IEventBusConfiguration>{adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}}},

}

let bootstrap: Bootstrap = null;
let server: WebServer = null;


@suite('functional/controllers/runtime_info_node_controller') @timeout(300000)
class Runtime_info_controllerSpec {


  static async before() {
    let settings = _.clone(settingsTemplate);


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
  async 'get nodes'() {
    const url = server.url();
    let p = SpawnHandle.do(__dirname + '/fake_app_node/node.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);

    let res = await request.get(url + API_SYSTEM_RUNTIME_NODES, {json: true});

    p.shutdown();
    await p.done;

    expect(res).to.not.be.null;
    expect(res).to.have.length(1);
    expect(res.map((x: any) => x.nodeId)).to.deep.eq(['fake_app_node']);
  }


}
