import {IFrameworkSupport} from "../IFrameworkSupport";
import {IStaticFiles} from "../../IStaticFiles";
import {IRoutingController} from "../../IRoutingController";

import * as http from "http";
import {IRoute} from "../../../server/IRoute";
import {IApplication} from "../../../../";


export class ExpressSupport implements IFrameworkSupport {

  static LIB: Function;

  wrapper: IFrameworkSupport;

  create() {
    ExpressSupport.LIB = require('./Express').Express;
    this.wrapper = Reflect.construct(ExpressSupport.LIB, []);
    //  this.app.disable("x-powered-by");
    this.wrapper.create();
    return this;
  }

  useRouteController(options: IRoutingController) {
    this.wrapper.useRouteController(options);
    return this;
  }

  useStaticRoute(options: IStaticFiles) {
    this.wrapper.useStaticRoute(options);
    return this;
  }

  handle(req: http.IncomingMessage, res: http.ServerResponse) {
    this.wrapper.handle(req, res);
  }

  app(): IApplication {
    return this.wrapper.app();
  }

  getRoutes(): IRoute[] {
    return this.wrapper.getRoutes();
  }

}
