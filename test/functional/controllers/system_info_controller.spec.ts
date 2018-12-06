import {suite, test, timeout} from "mocha-typescript";
import {Bootstrap, Container} from "@typexs/base";
import {
  API_SYSTEM_CONFIG,
  API_SYSTEM_MODULES,
  API_SYSTEM_ROUTES,
  API_SYSTEM_STORAGES,
  K_ROUTE_CONTROLLER
} from "../../../src/types";
import * as request from "request-promise";
import {expect} from "chai";
import {PERMISSION_ALLOW_ROUTES_VIEW, PERMISSION_ALLOW_STORAGE_ENTITY_VIEW, Server} from "../../../src";
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
    let res = await request.get(url + API_SYSTEM_ROUTES, {json: true});
    expect(res).to.have.length.greaterThan(4);
    expect(_.find(res, {controllerMethod: 'listRoutes'})).to.deep.eq({
      context: 'api',
      route: API_SYSTEM_ROUTES,
      method: 'get',
      params: [],
      controller: 'SystemInfoController',
      controllerMethod: 'listRoutes',
      permissions: [PERMISSION_ALLOW_ROUTES_VIEW],
      authorized: true
    });
    expect(_.find(res, {controllerMethod: 'getStorageEntities'})).to.deep.eq({
      context: 'api',
      route: '/api/system/storage/:name/entities',
      method: 'get',
      params: [
        {
          "index": 0,
          "name": "name",
          "parse": false,
          "required": true
        }
      ],
      controller: 'SystemInfoController',
      controllerMethod: 'getStorageEntities',
      permissions: [PERMISSION_ALLOW_STORAGE_ENTITY_VIEW],
      authorized: true
    });
  }


  @test @timeout(300000)
  async 'list config'() {
    const url = server.url();
    let res = await request.get(url + API_SYSTEM_CONFIG, {json: true});
    let baseConfig = res.shift();
    let compare = _.clone(settingsTemplate);

    compare.storage.default.name = 'default';
    compare.storage.default.entities = [];
    expect(baseConfig.storage).to.have.deep.eq(compare.storage);

    expect(baseConfig.server).to.have.deep.eq({
      "default": {
        "_debug": false,
        "fn": "root",
        "framework": "express",
        "host": "localhost",
        "ip": "127.0.0.1",
        "port": 4500,
        "protocol": "http",
        "routes": [
          {
            "authorizationChecker": "",
            "classTransformer": false,
            "context": "api",
            "controllers": [
              "SystemInfoController"
            ],
            "currentUserChecker": "",
            "limit": "10mb",
            "routePrefix": "api",
            "type": "routing_controller",
          }
        ],
        "stall": 0,
        "timeout": 60000,
        "type": "web",
      }
    });
  }


  @test @timeout(300000)
  async 'list modules'() {
    const url = server.url();
    let res = await request.get(url + API_SYSTEM_MODULES, {json: true});
    expect(_.map(res, r => r.name)).to.have.members(['@typexs/server', '@typexs/base', '@schematics/typexs']);
  }


  @test @timeout(300000)
  async 'list storages'() {
    const url = server.url();
    let res = await request.get(url + API_SYSTEM_STORAGES, {json: true});
    expect(res).to.have.length(1);
    res = res.shift()
    let compare = _.clone(settingsTemplate);
    compare.storage.default.name = 'default';
    compare.storage.default.entities = [];
    expect(res).to.have.deep.eq(compare.storage.default);
  }


}
