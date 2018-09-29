import {suite, test, timeout} from "mocha-typescript";
import {Bootstrap, Container} from "typexs-base";
import {K_ROUTE_CONTROLLER} from "../../../src/types";
import * as request from 'request-promise';
import {expect} from "chai";
import {Server} from "../../../src";
import * as _ from "lodash";


const settingsTemplate: any = {
  storage: {
    default: {
      synchronize: true,
      type: 'sqlite',
      database: ':memory:',
      logging: 'all',
      logger: 'simple-console'
    }
  },

  app: {name: 'demo', path: __dirname + '/../../..'},
  /*
    modules: {
      paths: [
        __dirname + '/packages'
      ],
    },
  */

  logging: {
    enable: true,
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

}

let bootstrap: Bootstrap = null;
let server: Server = null;


@suite('functional/controllers/system_info_controller')
class System_info_controllerSpec {


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
    await server.stop();
    Bootstrap.reset();

  }

  @test @timeout(300000)
  async 'list routes'() {

    const url = server.url();
    let res = await request.get(url + '/api/routes',{json:true});
    console.log(res)


  }


}

