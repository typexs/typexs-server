import * as http from "http";
import * as _ from 'lodash'
import {ClassLoader, Container, Inject, RuntimeLoader, TodoException} from "typexs-base";
import {getMetadataArgsStorage, useContainer} from "routing-controllers";

import {Server} from "./../server/Server";


import {IFrameworkSupport} from "./frameworks/IFrameworkSupport";
import {C_DEFAULT, K_CORE_LIB_CONTROLLERS, K_ROUTE_CONTROLLER, K_ROUTE_STATIC} from "../../types";
import {FrameworkSupportFactory} from "./frameworks/FrameworkSupportFactory";
import {IStaticFiles} from "./IStaticFiles";
import {IRoutingController} from "./IRoutingController";
import {Helper} from "./../Helper";
import {IWebServerInstanceOptions} from "./IWebServerInstanceOptions";
import {IServer} from "../server/IServer";
import {IRoute} from "../server/IRoute";
import {IMiddleware} from "../server/IMiddleware";


useContainer(Container);

export class WebServer extends Server implements IServer {

  private __prepared: boolean = false;

  @Inject('RuntimeLoader')
  loader: RuntimeLoader;

  framework: IFrameworkSupport;

  middlewares: IMiddleware[] = []

  name: string;


  initialize(options: IWebServerInstanceOptions) {
    _.defaults(options, {routes: []});
    super.initialize(options);
  }


  loadFramework() {
    if (!this.framework) {
      if (this.options().framework) {
        this.framework = (FrameworkSupportFactory.get(this.options().framework));
      } else {
        throw new Error('framework not present!')
      }
    }
    return this.framework;
  }


  options(): IWebServerInstanceOptions {
    return <IWebServerInstanceOptions>this._options;
  }


  prepare(): Promise<void> {
    if (this.__prepared) {
      return null;
    }
    this.__prepared = true;


    this.loadFramework().create();
    this.loadMiddleware();

    let opts = this.options();
    let classes = this.loader.getClasses(K_CORE_LIB_CONTROLLERS);
    let classesByGroup = Helper.resolveGroups(classes);

    for (let entry of opts.routes) {
      let key = entry.type;
      if (key === K_ROUTE_CONTROLLER) {
        let routing = <IRoutingController>entry;

        routing.classTransformer = false;

        let routeContext = C_DEFAULT;
        if (routing.context) {
          routeContext = routing.context;
        }

        let controllerClasses: Function[] = [];
        if (_.has(classesByGroup, routeContext)) {
          controllerClasses = classesByGroup[routeContext];
        }

        if (!_.isEmpty(routing.controllers)) {
          if (_.isString(routing.controllers[0])) {
            let clz = ClassLoader.importClassesFromAny(routing.controllers);
            controllerClasses = controllerClasses.concat(clz);
          }
        }

        routing.controllers = controllerClasses;
        if(!_.isEmpty(controllerClasses)){
          this.framework.useRouteController(routing);
        }
      } else if (key === K_ROUTE_STATIC) {
        this.framework.useStaticRoute(<IStaticFiles>entry);
      } else {
        throw  new TodoException()
      }
    }


    return null
  }

  private loadMiddleware(){
    let classes = this.loader.getClasses('server.middleware')
    for(let cls of classes){
      let instance = <IMiddleware>Container.get(cls);
      if(instance.validate(this.options())){
        instance.prepare();
        this.middlewares.push(instance);
      }
    }

    for(let middleware of this.middlewares){
      middleware.use(this.framework.app());
    }
  }


  response(req: http.IncomingMessage, res: http.ServerResponse) {
    this.framework.handle(req, res);
  }


  getUri() {
    let o = this.options();
    return o.protocol + '://' + o.ip + (o.port ? ':' + o.port : '');
  }


  getRoutes() {
    return this.framework.getRoutes();
  }

  start() {
    return super.start();
  }

  stop() {
    return super.stop();
  }

}
