import * as http from "http";
import * as _ from 'lodash'
import {Container, RuntimeLoader, TodoException, Inject, ClassLoader} from "typexs-base";
import {useContainer} from "routing-controllers";

import {Server} from "./../server/Server";

import {DEFAULT_SERVER_OPTIONS, IServerOptions} from "./../server/IServerOptions";


import {IFrameworkSupport} from "./frameworks/IFrameworkSupport";
import {C_DEFAULT, K_CORE_LIB_CONTROLLERS, K_ROUTE_CONTROLLER, K_ROUTE_STATIC} from "../../types";
import {FrameworkSupportFactory} from "./frameworks/FrameworkSupportFactory";
import {IStaticFiles} from "./IStaticFiles";
import {IRoutingController} from "./IRoutingController";
import {Helper} from "./../Helper";
import {IWebServerInstanceOptions} from "./IWebServerInstanceOptions";
import {IServer} from "../server/IServer";


useContainer(Container);

export class WebServer extends Server implements IServer {

  @Inject()
  loader: RuntimeLoader;

  framework: IFrameworkSupport;

  name: string;


  initialize(options: IWebServerInstanceOptions) {
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

    this.loadFramework().create();

    let opts = this.options();
    let classes = this.loader.getClasses(K_CORE_LIB_CONTROLLERS);
    let classesByGroup = Helper.resolveGroups(classes);

    for (let entry of opts.routes) {
      let key = Object.keys(entry).shift()
      if (key === K_ROUTE_CONTROLLER) {
        let routing = <IRoutingController>entry[key];

        routing.classTransformer = false;

        let routeContext = C_DEFAULT;
        if (_.has(routing, 'context')) {
          routeContext = routing.context;
        }

        let controllerClasses = [];
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
        this.framework.useRouteController(routing);
      } else if (key === K_ROUTE_STATIC) {
        this.framework.useStaticRoute(<IStaticFiles>entry[key]);
      } else {
        throw  new TodoException()
      }

    }


    return null
  }

  response(req: http.IncomingMessage, res: http.ServerResponse) {
    this.framework.handle(req, res);
  }

  start(){
    return super.start();
  }

  stop(){
    return super.stop();
  }

}
