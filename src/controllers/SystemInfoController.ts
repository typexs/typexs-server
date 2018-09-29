import * as _ from "lodash";
import {Inject, RuntimeLoader, Config, ClassLoader, IModule, CONFIG_NAMESPACE, BaseUtils, Storage} from "typexs-base";
import {ContextGroup} from "../decorators/ContextGroup";
import {Authorized, Get, getMetadataArgsStorage, JsonController} from "routing-controllers";
import {Credentials} from "../decorators/Credentials";
import {Helper, IRoute, ServerRegistry} from "..";
import {inspect} from "util";


@ContextGroup("api")
@JsonController()
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
}
