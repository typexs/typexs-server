import * as _ from "lodash";
import {
  ClassLoader,
  Config,
  IModule,
  Inject,
  Invoker,
  RuntimeLoader,
  Storage,
  TreeUtils,
  WalkValues
} from "@typexs/base";
import {ContextGroup} from "../decorators/ContextGroup";
import {Get, JsonController, Param} from "routing-controllers";
import {Access} from "../decorators/Access";
import {ServerRegistry} from "./../libs/server/ServerRegistry";
import {IRoute} from "./../libs/server/IRoute";
import {getMetadataArgsStorage as ormMetadataArgsStorage} from "typeorm"
import {
  PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
  PERMISSION_ALLOW_MODULES_VIEW,
  PERMISSION_ALLOW_ROUTES_VIEW,
  PERMISSION_ALLOW_STORAGE_ENTITY_VIEW,
  PERMISSION_ALLOW_STORAGES_VIEW
} from "../libs/Constants";
import {SystemInfoApi} from "../api/SystemInfo.api";

@ContextGroup("api")
@JsonController("/system")
export class SystemInfoController {


  @Inject("RuntimeLoader")
  loader: RuntimeLoader;

  @Inject("ServerRegistry")
  serverRegistry: ServerRegistry;

  @Inject("Storage")
  storage: Storage;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Access(PERMISSION_ALLOW_ROUTES_VIEW)
  @Get('/routes')
  listRoutes(): IRoute[] {
    let routes: IRoute[] = [];
    let instanceNames = this.serverRegistry.getInstanceNames();
    for (let instanceName of instanceNames) {
      let instance = this.serverRegistry.get(instanceName);
      routes = _.concat(routes, instance.getRoutes());
    }
    this.invoker.use(SystemInfoApi).prepareRoutes(routes);
    return routes;
  }


  @Access(PERMISSION_ALLOW_MODULES_VIEW)
  @Get('/modules')
  listModules(): IModule[] {
    let modules = this.loader.registry.modules();
    this.invoker.use(SystemInfoApi).prepareModules(modules);
    return modules;
  }


  @Access(PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW)
  @Get('/config')
  getConfig(): any {
    let _orgCfg = Config.get();
    let cfg = _.cloneDeepWith(_orgCfg);
    let filterKeys = this.getFilterKeys();

    TreeUtils.walk(cfg, (x: any) => {
      // TODO make this list configurable! system.info.hide.keys!
      if (filterKeys.indexOf(x.key) !== -1) {
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
    this.invoker.use(SystemInfoApi).prepareConfig(cfg);
    return cfg;
  }

  getFilterKeys(): string[] {
    // TODO cache this!
    let filterKeys = ['user', 'username', 'password'];
    let res: string[][] = <string[][]><any>this.invoker.use(SystemInfoApi).filterConfigKeys();
    if(res && _.isArray(res)){
      filterKeys = _.uniq(_.concat(filterKeys, ...res.filter(x => _.isArray(x))).filter(x => !_.isEmpty(x)));
    }

    return filterKeys;
  }


  @Access(PERMISSION_ALLOW_STORAGES_VIEW)
  @Get('/storages')
  getStorageInfo(): any {
    let options = _.cloneDeepWith(this.storage.getAllOptions());
    let filterKeys = this.getFilterKeys();
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
    this.invoker.use(SystemInfoApi).prepareStorageInfo(options);
    return options;
  }


  @Access(PERMISSION_ALLOW_STORAGE_ENTITY_VIEW)
  @Get('/storage/:name/entities')
  getStorageEntities(@Param('name') name: string): any[] {
    let ref = this.storage.get(name);
    let entityNames = _.map(ref.getOptions().entities, e => {
      if (_.isString(e)) {
        return e
      } else if (_.isFunction(e)) {
        return ClassLoader.getClassName(e)
      } else {
        return (<any>e).options.name;
      }
    });

    let tables = _.cloneDeepWith(ormMetadataArgsStorage().tables.filter(t => entityNames.indexOf(ClassLoader.getClassName(t.target)) !== -1));

    TreeUtils.walk(tables, (x: WalkValues) => {
      if (_.isFunction(x.value)) {
        if (_.isArray(x.parent)) {
          x.parent[x.index] = ClassLoader.getClassName(x.value);
        } else {
          x.parent[x.key] = ClassLoader.getClassName(x.value);
        }
      }
    });
    this.invoker.use(SystemInfoApi).prepareStorageEntities(tables);
    return tables;
  }

}
