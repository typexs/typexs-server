import {suite, test, timeout} from "mocha-typescript";
import {Bootstrap, Config, Container} from "@typexs/base";
import {API_SYSTEM_RUNTIME_NODES, API_SYSTEM_WORKERS, C_API, K_ROUTE_CONTROLLER} from "../../../src/libs/Constants";
import * as request from "request-promise";
import {expect} from "chai";
import {WebServer} from "../../../src";
import * as _ from "lodash";
import {SpawnHandle} from "../SpawnHandle";
import {TestHelper} from "../TestHelper";
import {TEST_STORAGE_OPTIONS} from "../config";
import {IEventBusConfiguration} from "commons-eventbus";
import {inspect} from "util";

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
  workers: {access: [{name: 'TaskQueueWorker', access: 'allow'}]}

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;


@suite('functional/controllers/runtime_info_workers_controller') @timeout(300000)
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
  async 'list workers'() {
    let url = server.url() + '/' + C_API;
    let res = await request.get(url + API_SYSTEM_WORKERS, {json: true});
    expect(res).to.not.be.null;
    expect(res).to.have.length(1);
    expect(res[0]).to.deep.eq({
      name: 'task_queue_worker',
      className: 'TaskQueueWorker',
      statistics: {
        stats: {all: 0, done: 0, running: 0, enqueued: 0, active: 0},
        paused: false,
        idle: true,
        occupied: false,
        running: false
      }
    });
  }


}
