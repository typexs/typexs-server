import * as express from "express";
import * as _ from "lodash";

import {createExpressServer} from "routing-controllers";
import {IStaticFiles} from "../../IStaticFiles";
import {IRoutingController} from "../../IRoutingController";
import {IFrameworkSupport} from "../IFrameworkSupport";
import {IApplication} from "../IApplication";
import * as http from "http";
import {IRoute} from "../../../server/IRoute";
import {C_DEFAULT} from "../../../../types";


export class Express implements IFrameworkSupport {

  _app: express.Application;

  _routes: IRoute[] = [];


  create() {
    this._app = express();
    this._app.disable('x-powered-by');
    return this;
  }


  useRouteController(options: IRoutingController) {
    let app = createExpressServer(options);
    app.disable('x-powered-by');

    for (let entry of app._router.stack) {
      if (entry.route) {
        let r = entry.route;
        let method = 'unknown';
        if (_.isArray(r.stack) && !_.isEmpty(r.stack)) {
          method = _.first(r.stack)['method'];
        }
        this._routes.push({
          context: options.context ? options.context : C_DEFAULT,
          route: r.path,
          method: method
        })
      }
    }

    let routes = this._routes
    this.app().use(app);
    /*
    if(options.routePrefix){
      this.app().use(options.routePrefix, app);
    }else{

    }*/

    return this;
  }


  useStaticRoute(options: IStaticFiles) {
    if (options.routePrefix) {
      this.app().use(options.routePrefix, express.static(options.path));
    } else {
      this.app().use(express.static(options.path));
    }
    return this;
  }


  getRoutes() {
    return this._routes;
  }

  // TODO
  useMiddleware() {
    this._app.use
  }

  app(): IApplication {
    if (!this._app) {
      throw new Error('app not created');
    }
    return this._app;
  }


  handle(req: http.IncomingMessage, res: http.ServerResponse) {
    this._app(req, res);
  }
}
