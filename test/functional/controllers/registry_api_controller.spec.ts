import {suite, test, timeout} from '@testdeck/mocha';
import {Bootstrap, Config, Injector, IRuntimeLoaderOptions, ITypexsOptions} from '@typexs/base';
import {
  API_CTRL_REGISTRY_DATA,
  API_CTRL_REGISTRY_NAMESPACES,
  API_CTRL_REGISTRY_SCHEMAS,
  DEFAULT_ANONYMOUS,
  K_ROUTE_CONTROLLER,
  PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE
} from '../../../src/libs/Constants';
import {expect} from 'chai';
import * as _ from 'lodash';
import {TEST_STORAGE_OPTIONS} from '../config';
import {HttpFactory, IHttp} from '@allgemein/http';
import {RandomData} from './fake_app_storage/entities/RandomData';
import {Server} from '../../../src/libs/server/Server';
import {Action} from 'routing-controllers';
import {IRole, IRolesHolder} from '@typexs/roles-api/index';
import {BasicPermission} from '@typexs/roles-api';
import {join} from 'path';
import {CONFIG_SCHEMA} from '../../../src/config.schema';


let permissionsCheck = false;

const settingsTemplate: ITypexsOptions & any = {
  storage: {
    default: TEST_STORAGE_OPTIONS
  },

  app: {
    name: 'demo',
    path: join(__dirname, 'apps', 'registry')
  },

  modules: <IRuntimeLoaderOptions>{
    paths: [join(__dirname, '..', '..', '..')],
    disableCache: true
  },

  logging: {
    enable: false,
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

        authorizationChecker: (action: Action, roles: any[]) => {
          if (!permissionsCheck) {
            return true;
          }
          return true;
        },

        currentUserChecker: (action: Action) => {
          if (!permissionsCheck) {
            return DEFAULT_ANONYMOUS;
          }
          return <IRolesHolder>{
            getRoles(): IRole[] {
              return <IRole[]>[
                <IRole>{
                  permissions: [
                    new BasicPermission(
                      PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE
                        .replace(':namespace', _.snakeCase(RandomData.name))
                    )
                  ],
                }
              ];
            }
          };
        }
      }]
    }
  }

};

let bootstrap: Bootstrap = null;
let server: Server = null;
let http: IHttp = null;

const carList = [
  'Volvo', 'Renault', 'Ford', 'Suzuki', 'BMW', 'VW',
  'GM', 'Audi', 'Mercedes', 'Tesla', 'Aston Martin'
];
let URL: string = null;

// let defaultStorageRef: StorageRef = null;

@suite('functional/controllers/registry_api_controller')
@timeout(300000)
// tslint:disable-next-line:class-name
class Storage_api_controllerSpec {


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
    URL = server.url();
    await server.start();

  }


  static async after() {
    if (server) {
      await server.stop();
    }
    // await bootstrap.getStorage().shutdown();
    await bootstrap.shutdown();
    Bootstrap.reset();
    Injector.reset();
    Config.clear();
  }


  @test
  async 'list registry namespaces - not permission check'() {
    permissionsCheck = false;
    const url = server.url();
    const res = await http.get(url + '/api' + API_CTRL_REGISTRY_NAMESPACES, {responseType: 'json', passBody: true});
    expect(res).to.not.be.null;
    expect(res).to.include.members(['config', 'typeorm']);
  }

  @test
  async 'get config registry'() {
    permissionsCheck = false;
    const url = server.url();
    const res = await http.get(url + '/api' + API_CTRL_REGISTRY_DATA.replace(':namespace', 'config'), {
      responseType: 'json',
      passBody: true
    }) as any;
    expect(res).to.not.be.null;
    expect(_.keys(res.definitions)).to.include.members(['App', 'Server']);
    expect(res.anyOf.map((x: any) => x.$ref)).to.include.members([
      '#/definitions/App',
      '#/definitions/Server'
    ]);
    const ref = _.cloneDeep(CONFIG_SCHEMA);
    delete ref['$schema'];
    expect(res.definitions.Server).to.be.deep.eq(ref.properties['server']);
  }


  @test
  async 'get registry schemas'() {
    permissionsCheck = false;
    const url = server.url();
    const res = await http.get(url + '/api' + API_CTRL_REGISTRY_SCHEMAS, {
      responseType: 'json',
      passBody: true
    }) as any;
    expect(res).to.not.be.null;
    expect(res).to.have.length.gte(2);
    expect(res.find((x: any) => x.registry === 'config')).to.be.deep.eq({registry: 'config', schemas: []});
    expect(res.find((x: any) => x.registry === 'typeorm')).to.be.deep.eq({registry: 'typeorm', schemas: ['default']});
  }

}
