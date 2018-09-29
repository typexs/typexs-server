// index.ts ingore

import * as express from "express";

import * as _ from "lodash";

import {createExpressServer, getMetadataArgsStorage} from "routing-controllers";
import {IStaticFiles} from "../../IStaticFiles";
import {IRoutingController} from "../../IRoutingController";
import {IFrameworkSupport} from "../IFrameworkSupport";

import * as http from "http";
import {IRoute} from "../../../server/IRoute";
import {C_DEFAULT} from "../../../../types";
import {CredentialsHelper, IApplication} from "../../../../";


export class Express implements IFrameworkSupport {

  _app: express.Application;

  _mounted_app: express.Application;

  _routes: IRoute[];

  _options: IRoutingController;

  create() {
    this._app = express();
    this._app.disable('x-powered-by');
    return this;
  }


  useRouteController(options: IRoutingController) {
    this._options = options;
    this._mounted_app = createExpressServer(options);
    this._mounted_app.disable('x-powered-by');
    this.app().use(this._mounted_app);
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
    if (!this._routes) {
      this._routes = [];

      let prefix = this._options.routePrefix;
      let actions = getMetadataArgsStorage().actions;
      let authHandlers = getMetadataArgsStorage().responseHandlers.filter(r => r.type === 'authorized');
      for (let entry of this._mounted_app._router.stack) {
        if (entry.route) {
          let r = entry.route;
          let method = 'unknown';
          let params = _.clone(entry.params);

          for (let handle of  r.stack) {
            if(handle.name !== 'routeHandler') continue;
            method = handle.method;
            let action = _.find(actions, a => (prefix ? '/' + prefix + a.route === r.path : a.route === r.path) && a.type.toLowerCase() == method.toLowerCase());
            let credential = null, authorized:boolean = false;
            if(action){
              credential = CredentialsHelper.getCredentialFor(action.target, action.method);
              authorized = !!_.find(authHandlers, a => a.target === action.target && a.method === action.method) ;
            }
            this._routes.push({
              context: this._options.context ? this._options.context : C_DEFAULT,
              route: r.path,
              method: method,
              params: !_.isEmpty(params) ? params : null,
              controller: action.target.name,
              controllerMethod: action.method,
              credential: credential ? credential.rights : null,
              authorized: authorized
            })
          }
        }
      }
      //this._routes = _.uniq(this._routes);
    }

    return _.clone(this._routes);
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
