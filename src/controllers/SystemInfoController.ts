import * as _ from "lodash";
import {ClassLoader, Config, IModule, Inject, RuntimeLoader, Storage} from "typexs-base";
import {ContextGroup} from "../decorators/ContextGroup";
import {Get, getMetadataArgsStorage, JsonController, Param} from "routing-controllers";
import {Credentials} from "../decorators/Credentials";
import {Helper, IRoute, ServerRegistry} from "..";
import {getMetadataArgsStorage as ormMetadataArgsStorage} from "typeorm"

@ContextGroup("api")
@JsonController("/system")
export class SystemInfoController {


  @Inject("RuntimeLoader")
  loader: RuntimeLoader;

  @Inject("ServerRegistry")
  serverRegistry: ServerRegistry;

  @Inject("Storage")
  storage: Storage;

  @Credentials('allow routes view')
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


  @Credentials('allow modules view')
  @Get('/modules')
  listModules(): IModule[] {
    return this.loader.registry.modules();
  }

  @Credentials('allow global config view')
  @Get('/config')
  getConfig(): any {
    let cfg = _.clone(Config.get());
    Helper.walk(cfg, (x: any) => {
      if (['user', 'username', 'password'].indexOf(x.key) !== -1 && x.location.indexOf('storage') !== -1) {
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

  @Credentials('allow storages view')
  @Get('/storages')
  getStorageInfo(): any {
    let options = _.clone(this.storage.getAllOptions());
    Helper.walk(options, (x: any) => {
      if (['user', 'username', 'password'].indexOf(x.key) !== -1 && x.location.indexOf('storage') !== -1) {
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

  @Credentials('allow storages entity view')
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

    let tables = ormMetadataArgsStorage().tables.filter(t => entityNames.indexOf(ClassLoader.getClassName(t.target)) !== -1);

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
