import * as _ from 'lodash';
import {
  C_CONFIG_FILTER_KEYS,
  ClassLoader,
  Config,
  IModule,
  Inject, Injector,
  Invoker,
  RuntimeLoader,
  Storage,
  System,
  Workers
} from '@typexs/base';
import {Get, JsonController, Param, QueryParam} from 'routing-controllers';
import {ServerRegistry} from './../libs/server/ServerRegistry';
import {IRoute} from './../libs/server/IRoute';
import {getMetadataArgsStorage as ormMetadataArgsStorage} from 'typeorm';
import {
  _API_CTRL_SYSTEM,
  _API_CTRL_SYSTEM_CONFIG,
  _API_CTRL_SYSTEM_MODULES,
  _API_CTRL_SYSTEM_ROUTES,
  _API_CTRL_SYSTEM_RUNTIME_INFO,
  _API_CTRL_SYSTEM_RUNTIME_NODE,
  _API_CTRL_SYSTEM_RUNTIME_NODES,
  _API_CTRL_SYSTEM_RUNTIME_REMOTE_INFOS,
  _API_CTRL_SYSTEM_STORAGES,
  _API_CTRL_SYSTEM_WORKERS, C_API,
  PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
  PERMISSION_ALLOW_MODULES_VIEW,
  PERMISSION_ALLOW_ROUTES_VIEW,
  PERMISSION_ALLOW_RUNTIME_INFO_VIEW,
  PERMISSION_ALLOW_RUNTIME_NODE_VIEW,
  PERMISSION_ALLOW_RUNTIME_NODES_VIEW,
  PERMISSION_ALLOW_RUNTIME_REMOTE_INFOS_VIEW,
  PERMISSION_ALLOW_STORAGE_ENTITY_VIEW,
  PERMISSION_ALLOW_STORAGES_VIEW, PERMISSION_ALLOW_WORKERS_INFO
} from '../libs/Constants';
import {ServerNodeInfoApi} from '../api/ServerNodeInfo.api';
import {IWorkerInfo} from '@typexs/base/libs/worker/IWorkerInfo';
import {TreeUtils, WalkValues} from 'commons-base';
import {ContextGroup} from '../decorators/ContextGroup';
import {Access} from '../decorators/Access';

@ContextGroup(C_API)
@JsonController(_API_CTRL_SYSTEM)
export class SystemAPIController {

  @Inject(System.NAME)
  system: System;

  @Inject(RuntimeLoader.NAME)
  loader: RuntimeLoader;

  @Inject(ServerRegistry.NAME)
  serverRegistry: ServerRegistry;

  @Inject(Storage.NAME)
  storage: Storage;

  @Inject(Invoker.NAME)
  invoker: Invoker;



  @Access(PERMISSION_ALLOW_RUNTIME_INFO_VIEW)
  @Get(_API_CTRL_SYSTEM_RUNTIME_INFO)
  info(): any {
    return this.system.info;
  }


  @Access(PERMISSION_ALLOW_RUNTIME_NODE_VIEW)
  @Get(_API_CTRL_SYSTEM_RUNTIME_NODE)
  node(): any {
    return this.system.node;
  }


  @Access(PERMISSION_ALLOW_RUNTIME_NODES_VIEW)
  @Get(_API_CTRL_SYSTEM_RUNTIME_NODES)
  nodes(): any {
    return this.system.nodes;
  }


  @Access(PERMISSION_ALLOW_RUNTIME_REMOTE_INFOS_VIEW)
  @Get(_API_CTRL_SYSTEM_RUNTIME_REMOTE_INFOS)
  nodesInfo(@QueryParam('nodeIds') nodeIds: string[] = []): any {
    return this.system.getNodeInfos(nodeIds);
  }


  // TODO impl worker statistics
  @Access(PERMISSION_ALLOW_WORKERS_INFO)
  @Get(_API_CTRL_SYSTEM_WORKERS)
  listWorkers(): IWorkerInfo[] {
    return (<Workers>Injector.get(Workers.NAME)).infos();
  }


  @Access(PERMISSION_ALLOW_ROUTES_VIEW)
  @Get(_API_CTRL_SYSTEM_ROUTES)
  listRoutes(): IRoute[] {
    let routes: IRoute[] = [];
    const instanceNames = this.serverRegistry.getInstanceNames();
    for (const instanceName of instanceNames) {
      const instance = this.serverRegistry.get(instanceName);
      routes = _.concat(routes, instance.getRoutes());
    }
    this.invoker.use(ServerNodeInfoApi).prepareRoutes(routes);
    return routes;
  }


  @Access(PERMISSION_ALLOW_MODULES_VIEW)
  @Get(_API_CTRL_SYSTEM_MODULES)
  listModules(): IModule[] {
    const modules = this.loader.registry.modules();
    this.invoker.use(ServerNodeInfoApi).prepareModules(modules);
    return modules;
  }


  @Access(PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW)
  @Get(_API_CTRL_SYSTEM_CONFIG)
  getConfig(): any {
    const _orgCfg = Config.get();
    const cfg = _.cloneDeepWith(_orgCfg);
    const filterKeys = this.getFilterKeys();

    TreeUtils.walk(cfg, (x: WalkValues) => {
      // TODO make this list configurable! system.info.hide.keys!
      if (_.isString(x.key) && filterKeys.indexOf(x.key) !== -1) {
        delete x.parent[x.key];
      }
      if (_.isFunction(x.value)) {
        if (_.isArray(x.parent)) {
          x.parent[x.index] = ClassLoader.getClassName(x.value);
        } else {
          x.parent[x.key] = ClassLoader.getClassName(x.value);
        }
      }
    });
    this.invoker.use(ServerNodeInfoApi).prepareConfig(cfg);
    return cfg;
  }


  getFilterKeys(): string[] {
    // TODO cache this!
    let filterKeys = C_CONFIG_FILTER_KEYS; // get them from base/ConfigUtils
    const res: string[][] = <string[][]><any>this.invoker.use(ServerNodeInfoApi).filterConfigKeys();
    if (res && _.isArray(res)) {
      filterKeys = _.uniq(_.concat(filterKeys, ...res.filter(x => _.isArray(x))).filter(x => !_.isEmpty(x)));
    }
    return filterKeys;
  }


  @Access(PERMISSION_ALLOW_STORAGES_VIEW)
  @Get(_API_CTRL_SYSTEM_STORAGES)
  getStorageInfo(): any {
    const options = _.cloneDeepWith(this.storage.getAllOptions());
    const filterKeys = this.getFilterKeys();
    TreeUtils.walk(options, (x: WalkValues) => {
      if (_.isString(x.key) && filterKeys.indexOf(x.key) !== -1) {
        delete x.parent[x.key];
      }
      if (_.isFunction(x.value)) {
        if (_.isArray(x.parent)) {
          x.parent[x.index] = ClassLoader.getClassName(x.value);
        } else {
          x.parent[x.key] = ClassLoader.getClassName(x.value);
        }
      }
    });
    this.invoker.use(ServerNodeInfoApi).prepareStorageInfo(options);
    return options;
  }


  @Access(PERMISSION_ALLOW_STORAGE_ENTITY_VIEW)
  @Get('/storage/:name/entities')
  getStorageEntities(@Param('name') name: string): any[] {
    const ref = this.storage.get(name);
    const entityNames = _.map(ref.getOptions().entities, e => {
      if (_.isString(e)) {
        return e;
      } else if (_.isFunction(e)) {
        return ClassLoader.getClassName(e);
      } else {
        return (<any>e).options.name;
      }
    });

    const tables = _.cloneDeepWith(ormMetadataArgsStorage().tables
      .filter(t => entityNames.indexOf(ClassLoader.getClassName(t.target)) !== -1));

    TreeUtils.walk(tables, (x: WalkValues) => {
      if (_.isFunction(x.value)) {
        if (_.isArray(x.parent)) {
          x.parent[x.index] = ClassLoader.getClassName(x.value);
        } else {
          x.parent[x.key] = ClassLoader.getClassName(x.value);
        }
      }
    });
    this.invoker.use(ServerNodeInfoApi).prepareStorageEntities(tables);
    return tables;
  }


}
