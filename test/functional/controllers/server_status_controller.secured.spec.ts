import {suite, test, timeout} from '@testdeck/mocha';
import {Bootstrap, Config, Injector} from '@typexs/base';
import {
  API_CTRL_SERVER_CONFIG,
  API_CTRL_SERVER_CONFIG_KEY,
  API_CTRL_SERVER_PING,
  API_CTRL_SERVER_ROUTES,
  C_API,
  DEFAULT_ANONYMOUS,
  K_CONFIG_ANONYMOUS_ALLOW,
  K_CONFIG_PERMISSIONS,
  K_ROUTE_CONTROLLER,
  PERMISSION_ALLOW_STORAGE_ENTITY_VIEW
} from '../../../src/libs/Constants';
import {WebServer} from '../../../src/libs/web/WebServer';
import * as _ from 'lodash';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
import {HttpFactory, IHttp} from '@allgemein/http';
import {expect} from 'chai';
import {Action} from 'routing-controllers/types/Action';
import {IRole, IRolesHolder} from '@typexs/roles-api/index';


const LOG_EVENT = TestHelper.logEnable(false);

const callback = {
  fn: (action: Action): any => DEFAULT_ANONYMOUS
};

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
        routePrefix: 'api',
        currentUserChecker: (action: Action) => {
          return callback['fn'](action);
        }
      }]
    }
  }
};

let bootstrap: Bootstrap = null;
let server: WebServer = null;
let http: IHttp = null;
let url: string = null;

@suite('functional/controllers/server_status_controller - secured') @timeout(300000)
class ServerStatusControllerSpec {


  static async before() {
    Bootstrap.reset();
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
    url = server.url() + '/' + C_API;
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
  async 'list config (in secured mode without permission)'() {
    Config.set(K_CONFIG_ANONYMOUS_ALLOW, false);
    Config.set(K_CONFIG_PERMISSIONS, {
      'server.default.routes': ['allow view config server routes']
    });

    callback['fn'] = () => {
      return <IRolesHolder>{
        getRoles(): IRole[] {
          return [{
            role: 'test', permissions: [{
              type: 'single',
              permission: 'allow view other configurations'
            }
            ]
          }];
        },
        getIdentifier(): string | number {
          return 'TEST';
        }
      };
    };

    expect(Config.get(K_CONFIG_ANONYMOUS_ALLOW)).to.be.false;

    const baseConfig = await http.get(url + API_CTRL_SERVER_CONFIG, {responseType: 'json', passBody: true}) as any;
    expect(baseConfig.server).to.have.deep.eq({
      'default': {
        '_debug': false,
        'fn': 'root',
        'framework': 'express',
        'host': 'localhost',
        'ip': '127.0.0.1',
        'port': 4500,
        'protocol': 'http',
        'stall': 0,
        'timeout': 60000,
        'type': 'web',
      }
    });
  }


  @test
  async 'list config (in secured mode with permission)'() {
    Config.set(K_CONFIG_ANONYMOUS_ALLOW, false);
    Config.set(K_CONFIG_PERMISSIONS, {
      'server.default.routes': ['allow view config server routes']
    });

    callback['fn'] = () => {
      return <IRolesHolder>{
        getRoles(): IRole[] {
          return [{role: 'test', permissions: [{permission: 'allow view config server routes'}]}];
        },
        getIdentifier(): string | number {
          return 'TEST';
        }
      };
    };

    expect(Config.get(K_CONFIG_ANONYMOUS_ALLOW)).to.be.false;

    const baseConfig = await http.get(url + API_CTRL_SERVER_CONFIG, {responseType: 'json', passBody: true}) as any;
    expect(baseConfig.server).to.have.deep.eq({
      'default': {
        '_debug': false,
        'fn': 'root',
        'framework': 'express',
        'host': 'localhost',
        'ip': '127.0.0.1',
        'port': 4500,
        'protocol': 'http',
        'routes': [
          {
            'authorizationChecker': '',
            'classTransformer': false,
            'context': 'api',
            'controllers': [
              'DistributedStorageAPIController',
              'FileSystemAPIController',
              'RegistryAPIController',
              'ServerStatusAPIController',
              'StorageAPIController',
              'SystemNodeInfoAPIController',
              'TasksAPIController'
            ],
            'currentUserChecker': 'currentUserChecker',
            'limit': '10mb',
            'middlewares': [],
            'routePrefix': 'api',
            'type': 'routing_controller',
          }
        ],
        'stall': 0,
        'timeout': 60000,
        'type': 'web',
      }
    });
  }


  @test
  async 'list config by key (in secured mode with permission)'() {
    // add config setting
    Config.set(K_CONFIG_ANONYMOUS_ALLOW, false);
    Config.set(K_CONFIG_PERMISSIONS, {
      'server.default.routes': ['allow view config server routes']
    });

    callback['fn'] = () => {
      return <IRolesHolder>{
        getRoles(): IRole[] {
          return [{role: 'test', permissions: [{permission: 'allow view config server routes'}]}];
        },
        getIdentifier(): string | number {
          return 'TEST';
        }
      };
    };

    expect(Config.get(K_CONFIG_ANONYMOUS_ALLOW)).to.be.false;

    const baseConfig = await http.get(url + API_CTRL_SERVER_CONFIG_KEY
      .replace(':key', 'server.default'), {responseType: 'json', passBody: true}) as any;
    expect(baseConfig).to.have.deep.eq({
      '_debug': false,
      'fn': 'root',
      'framework': 'express',
      'host': 'localhost',
      'ip': '127.0.0.1',
      'port': 4500,
      'protocol': 'http',
      'routes': [
        {
          'authorizationChecker': '',
          'classTransformer': false,
          'context': 'api',
          'controllers': [
            'DistributedStorageAPIController',
            'FileSystemAPIController',
            'RegistryAPIController',
            'ServerStatusAPIController',
            'StorageAPIController',
            'SystemNodeInfoAPIController',
            'TasksAPIController'
          ],
          'currentUserChecker': 'currentUserChecker',
          'limit': '10mb',
          'middlewares': [],
          'routePrefix': 'api',
          'type': 'routing_controller',
        }
      ],
      'stall': 0,
      'timeout': 60000,
      'type': 'web',
    });
  }


  @test
  async 'list config by key (in secured mode without permission)'() {
    // add config setting
    Config.set(K_CONFIG_ANONYMOUS_ALLOW, false);
    Config.set(K_CONFIG_PERMISSIONS, {
      'server.default.routes': ['allow view config server routes']
    });

    callback['fn'] = () => {
      return <IRolesHolder>{
        getRoles(): IRole[] {
          return [{role: 'test', permissions: [{permission: 'allow view some others configurations'}]}];
        },
        getIdentifier(): string | number {
          return 'TEST';
        }
      };
    };

    expect(Config.get(K_CONFIG_ANONYMOUS_ALLOW)).to.be.false;

    const baseConfig = await http.get(url + API_CTRL_SERVER_CONFIG_KEY
      .replace(':key', 'server.default'), {responseType: 'json', passBody: true}) as any;
    expect(baseConfig).to.have.deep.eq({
      '_debug': false,
      'fn': 'root',
      'framework': 'express',
      'host': 'localhost',
      'ip': '127.0.0.1',
      'port': 4500,
      'protocol': 'http',
      'stall': 0,
      'timeout': 60000,
      'type': 'web',
    });
  }


  @test
  async 'list routes (in secured mode without permission)'() {
    callback['fn'] = () => {
      return <IRolesHolder>{
        getRoles(): IRole[] {
          return [{role: 'test', permissions: [{permission: 'allow access some stuff'}]}];
        },
        getIdentifier(): string | number {
          return 'TEST';
        }
      };
    };

    const res = await http.get(url + API_CTRL_SERVER_ROUTES, {responseType: 'json', passBody: true});
    expect(res).to.not.be.null;
    expect(res).to.have.length(5);
    expect(_.filter(res, {authorized: false})).to.have.length(5);
    expect(_.find(res, {route: '/api/ping'})).to.deep.eq({
      context: 'api',
      route: '/' + C_API + API_CTRL_SERVER_PING,
      method: 'get',
      params: [],
      controller: 'ServerStatusAPIController',
      controllerMethod: 'ping',
      permissions: null,
      authorized: false
    });
    expect(_.find(res, {controllerMethod: 'getStorageEntities'})).to.be.undefined;

  }

  @test
  async 'list routes (in secured mode with permission)'() {
    callback['fn'] = () => {
      return <IRolesHolder>{
        getRoles(): IRole[] {
          return [{role: 'test', permissions: [{permission: PERMISSION_ALLOW_STORAGE_ENTITY_VIEW}]}];
        },
        getIdentifier(): string | number {
          return 'TEST';
        }
      };
    };

    const res = await http.get(url + API_CTRL_SERVER_ROUTES, {responseType: 'json', passBody: true});
    expect(res).to.not.be.null;
    expect(res).to.have.length(6);
    expect(_.filter(res, {authorized: false})).to.have.length(5);
    expect(_.find(res, {route: '/api/ping'})).to.deep.eq({
      context: 'api',
      route: '/' + C_API + API_CTRL_SERVER_PING,
      method: 'get',
      params: [],
      controller: 'ServerStatusAPIController',
      controllerMethod: 'ping',
      permissions: null,
      authorized: false
    });
    expect(_.find(res, {controllerMethod: 'getStorageEntities'})).to.be.deep.eq({
      context: 'api',
      route: '/api/system/storage/:name/entities',
      method: 'get',
      params: [
        {
          'index': 0,
          'name': 'name',
          'parse': false,
          'required': true
        }
      ],
      controller: 'SystemNodeInfoAPIController',
      controllerMethod: 'getStorageEntities',
      permissions: [PERMISSION_ALLOW_STORAGE_ENTITY_VIEW],
      authorized: true
    });
  }


}
