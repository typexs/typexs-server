import * as _ from "lodash";
import {Inject, RuntimeLoader, Config, IModule} from "typexs-base";
import {ContextGroup} from "../decorators/ContextGroup";
import {Authorized, Get, getMetadataArgsStorage, JsonController} from "routing-controllers";
import {Credentials} from "../decorators/Credentials";
import {IRoute, ServerRegistry} from "..";


@ContextGroup("api")
@JsonController()
export class SystemInfoController {


  @Inject("RuntimeLoader")
  loader: RuntimeLoader;

  @Inject("ServerRegistry")
  serverRegistry: ServerRegistry;


  @Credentials('allow routes view')
  @Get('/routes')
  listRoutes(): IRoute[] {
    let routes:IRoute[] = [];
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
    let cfg = Config.get();


    return cfg;
  }

}
