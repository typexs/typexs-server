import * as _ from "lodash";
import {ClassLoader, Config, IModule, Inject, RuntimeLoader, Storage} from "@typexs/base";
import {ContextGroup} from "../decorators/ContextGroup";
import {Get, JsonController, Param} from "routing-controllers";
import {Access} from "../decorators/Access";
import {Helper} from "./../libs/Helper";
import {ServerRegistry} from "./../libs/server/ServerRegistry";
import {IRoute} from "./../libs/server/IRoute";
import {getMetadataArgsStorage as ormMetadataArgsStorage} from "typeorm"
import {
  PERMISSION_ALLOW_ROUTES_VIEW,
  PERMISSION_ALLOW_STORAGE_ENTITY_VIEW,
  PERMISSION_ALLOW_STORAGES_VIEW,
  PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
  PERMISSION_ALLOW_MODULES_VIEW
} from "../libs/Constants";

@ContextGroup("api")
@JsonController("/system")
export class SystemInfoController {


  @Inject("RuntimeLoader")
  loader: RuntimeLoader;

  @Inject("ServerRegistry")
  serverRegistry: ServerRegistry;

  @Inject("Storage")
  storage: Storage;


  @Access(PERMISSION_ALLOW_ROUTES_VIEW)
  @Get('/routes')
  listRoutes(): IRoute[] {
    let routes: IRoute[] = [];
    let instanceNames = this.serverRegistry.getInstanceNames();
    for (let instanceName of instanceNames) {
      let instance = this.serverRegistry.get(instanceName);
      routes = _.concat(routes, instance.getRoutes());
    }
    return routes;
  }


  @Access(PERMISSION_ALLOW_MODULES_VIEW)
  @Get('/modules')
  listModules(): IModule[] {
    return this.loader.registry.modules();
  }


  @Access(PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW)
  @Get('/config')
  getConfig(): any {
    let _orgCfg = Config.get();
    let cfg = _.cloneDeepWith(_orgCfg);
    Helper.walk(cfg, (x: any) => {
      // TODO make this list configurable! system.info.hide.keys!
      if (['user', 'username', 'password'].indexOf(x.key) !== -1) {
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
    return cfg;
  }


  @Access(PERMISSION_ALLOW_STORAGES_VIEW)
  @Get('/storages')
  getStorageInfo(): any {
    let options = _.cloneDeepWith(this.storage.getAllOptions());
    Helper.walk(options, (x: any) => {
      if (['user', 'username', 'password'].indexOf(x.key) !== -1) {
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

    Helper.walk(tables, (x: any) => {
      if (_.isFunction(x.value)) {
        if (_.isArray(x.parent)) {
          x.parent[x.index] = ClassLoader.getClassName(x.value);
        } else {
          x.parent[x.key] = ClassLoader.getClassName(x.value);
        }
      }
    });
    return tables;
  }

}
