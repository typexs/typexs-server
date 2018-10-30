// index.ts ingore

import * as express from "express";

import * as _ from "lodash";

import {Action, ActionMetadata, createExpressServer, getMetadataArgsStorage} from "routing-controllers";
import {IStaticFiles} from "../../IStaticFiles";
import {IRoutingController} from "../../IRoutingController";
import {IFrameworkSupport} from "../IFrameworkSupport";

import * as http from "http";
import {IRoute} from "../../../server/IRoute";
import {C_DEFAULT} from "../../../../types";
import {CredentialsHelper, IApplication} from "../../../../";
import {ActionMetadataArgs} from "../../../../../node_modules/routing-controllers/metadata/args/ActionMetadataArgs";
import {ActionType} from "../../../../../node_modules/routing-controllers/metadata/types/ActionType";


interface ActionResolved {
  route: string;
  type: ActionType,
  action: ActionMetadataArgs;
  authorized: boolean;
  credential: string | string[];
  params: any[];
}

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

  resolveMetadata(): ActionResolved[] {
    let res: ActionResolved[] = [];
    const metadataStore = getMetadataArgsStorage();
    const authHandlers = metadataStore.responseHandlers.filter(r => r.type === 'authorized');
    metadataStore.controllers.forEach(controller => {
      const controllerActions = _.filter(metadataStore.actions, a => a.target == controller.target)
      controllerActions.forEach(action => {
        let route = action.route instanceof RegExp ? action.route.source : action.route;
        if (controller.route) {
          route = controller.route + route;
        }

        const params = metadataStore.params.filter(param => param.method == action.method && param.object.constructor == action.target)

        // TODO handle regex
        const credential = CredentialsHelper.getCredentialFor(action.target, action.method);
        const authorized = !!_.find(authHandlers, a => a.target === action.target && a.method === action.method);
        let entry: ActionResolved = {
          route: route,
          type: action.type,
          action: action,
          credential: credential ? credential.rights : null,
          authorized: authorized,
          params: params.map(p => {
            return {name: p.name, required: p.required, index: p.index, parse: p.parse}
          })
        }
        res.push(entry);
      })

    })
    return res;
  }

  getRoutes() {
    if (!this._routes) {
      this._routes = [];

      for (let appSetting of this._mapOptions) {
        const options = appSetting.options;
        const app = appSetting.mounted;
        let prefix = options.routePrefix;

        let actions = this.resolveMetadata();

        for (let entry of app._router.stack) {
          if (entry.route) {
            let r = entry.route;
            let method = 'unknown';
            let params = _.clone(entry.params);

            for (let handle of  r.stack) {
              if (handle.name !== 'routeHandler') continue;
              method = handle.method;
              let action = _.find(actions, a => (prefix ? '/' + prefix + a.route === r.path : a.route === r.path) &&
                a.type.toLowerCase() == method.toLowerCase());

              if (action) {

                this._routes.push({
                  context: options.context ? options.context : C_DEFAULT,
                  route: prefix ? '/' + prefix + action.route : action.route,
                  method: method,
                  params: action.params,
                  controller: action.action.target.name,
                  controllerMethod: action.action.method,
                  credential: action.credential ? action.credential : null,
                  authorized: action.authorized
                })

              } else {
                this._routes.push({
                  context: options.context ? options.context : C_DEFAULT,
                  route: r.path,
                  method: method,
                  params: !_.isEmpty(params) ? params : null,
                  authorized: false
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
