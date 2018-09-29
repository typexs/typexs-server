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


  _routes: IRoute[];

  _mapOptions: { options: IRoutingController, mounted: express.Application }[] = [];

  create() {
    this._app = express();
    this._app.disable('x-powered-by');
    return this;
  }


  useRouteController(options: IRoutingController) {
    const app = createExpressServer(options);
    app.disable('x-powered-by');
    this.app().use(app);
    this._mapOptions.push({options: options, mounted: app});
    return this;
  }


  useStaticRoute(options: IStaticFiles) {
    let app: express.Application = null;
    if (options.routePrefix) {
      app = <express.Application>this.app().use(options.routePrefix, express.static(options.path));
    } else {
      app = <express.Application>this.app().use(express.static(options.path));
    }
    this._mapOptions.push({options: options, mounted: app});
    return this;
  }


  getRoutes() {
    if (!this._routes) {
      this._routes = [];

      for (let appSetting of this._mapOptions) {
        const options = appSetting.options;
        const app = appSetting.mounted;
        let prefix = options.routePrefix;
        let actions = getMetadataArgsStorage().actions;
        let authHandlers = getMetadataArgsStorage().responseHandlers.filter(r => r.type === 'authorized');
        for (let entry of app._router.stack) {
          if (entry.route) {
            let r = entry.route;
            let method = 'unknown';
            let params = _.clone(entry.params);

            for (let handle of  r.stack) {
              if (handle.name !== 'routeHandler') continue;
              method = handle.method;
              let action = _.find(actions, a => (prefix ? '/' + prefix + a.route === r.path : a.route === r.path) && a.type.toLowerCase() == method.toLowerCase());
              let credential = null, authorized: boolean = false;
              if (action) {
                credential = CredentialsHelper.getCredentialFor(action.target, action.method);
                authorized = !!_.find(authHandlers, a => a.target === action.target && a.method === action.method);

                this._routes.push({
                  context: options.context ? options.context : C_DEFAULT,
                  route: r.path,
                  method: method,
                  params: !_.isEmpty(params) ? params : null,
                  controller: action.target.name,
                  controllerMethod: action.method,
                  credential: credential ? credential.rights : null,
                  authorized: authorized
                })

              } else {
                this._routes.push({
                  context: options.context ? options.context : C_DEFAULT,
                  route: r.path,
                  method: method,
                  params: !_.isEmpty(params) ? params : null,
                  authorized: authorized
                })

              }

            }
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
