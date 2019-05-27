import * as http from 'http';
import * as _ from 'lodash';
import {MetaArgs} from 'commons-base/browser';
import {ClassLoader, Container, Inject, RuntimeLoader, TodoException} from '@typexs/base';
import {Action, getMetadataArgsStorage, useContainer} from 'routing-controllers';

import {Server} from './../server/Server';


import {IFrameworkSupport} from './frameworks/IFrameworkSupport';
import {C_DEFAULT} from '../Constants';
import {FrameworkSupportFactory} from './frameworks/FrameworkSupportFactory';
import {IStaticFiles} from './IStaticFiles';
import {IRoutingController} from './IRoutingController';
import {Helper} from './../Helper';
import {IWebServerInstanceOptions} from './IWebServerInstanceOptions';
import {IServer} from '../server/IServer';
import {IMiddleware} from '../server/IMiddleware';
import {IRoute, K_CORE_LIB_CONTROLLERS, K_ROUTE_CACHE, K_ROUTE_CONTROLLER, K_ROUTE_STATIC} from '../../';


useContainer(Container);

export class WebServer extends Server implements IServer {

  private __prepared = false;

  @Inject(RuntimeLoader.NAME)
  private loader: RuntimeLoader;

  private framework: IFrameworkSupport;

  private _middlewares: IMiddleware[] = [];

  name: string;


  initialize(options: IWebServerInstanceOptions) {
    _.defaults(options, {routes: []});
    super.initialize(options);
    this.loadMiddleware();
  }


  options(): IWebServerInstanceOptions {
    return <IWebServerInstanceOptions>this._options;
  }


  async prepare(): Promise<void> {
    if (this.__prepared) {
      return null;
    }
    this.__prepared = true;

    this.loadFramework().create();
    await this.prepareMiddleware();
    await this.useMiddleware();

    const opts = this.options();
    const classes = this.loader.getClasses(K_CORE_LIB_CONTROLLERS);
    // TODO check if allowed?

    const classesByGroup = Helper.resolveGroups(classes);

    for (const entry of opts.routes) {
      const key = entry.type;

      if (key === K_ROUTE_CONTROLLER) {
        const routing = <IRoutingController>entry;

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
            const clz = ClassLoader.importClassesFromAny(routing.controllers);
            controllerClasses = controllerClasses.concat(clz);
          }
        }

        routing.controllers = controllerClasses;
        routing.middlewares = getMetadataArgsStorage().middlewares.map(x => x.target);
        if (!_.isEmpty(controllerClasses)) {
          await this.extendOptionsForMiddleware(routing);
          this.applyDefaultOptionsIfNotGiven(routing);
          this.framework.useRouteController(routing);


        }
      } else if (key === K_ROUTE_STATIC) {
        await this.extendOptionsForMiddleware(entry);
        this.framework.useStaticRoute(<IStaticFiles>entry);
      } else {
        throw  new TodoException();
      }
    }

    const routes = MetaArgs.key(K_ROUTE_CACHE);
    this.getRoutes().map(p => routes.push(p));
    return null;
  }

  private applyDefaultOptionsIfNotGiven(options: IRoutingController) {
    if (!_.has(options, 'authorizationChecker')) {
      options.authorizationChecker = (action: Action, roles: any[]) => {
        return true;
      };
    }
    if (!_.has(options, 'currentUserChecker')) {
      options.currentUserChecker = (action: Action) => {
        return null;
      };
    }
  }


  private loadFramework() {
    if (!this.framework) {
      if (this.options().framework) {
        this.framework = (FrameworkSupportFactory.get(this.options().framework));
      } else {
        throw new Error('framework not present!');
      }
    }
    return this.framework;
  }


  private loadMiddleware() {
    const classes = this.loader.getClasses('server.middleware');
    const routingMiddleware = getMetadataArgsStorage().middlewares;

    for (const cls of classes) {
      const skip = routingMiddleware.find(m => m.target === cls);
      if (!skip) {
        const instance = <IMiddleware>Container.get(cls);
        if (instance['validate'] && instance.validate(_.clone(this.options()))) {
          this._middlewares.push(instance);
        }
      }
    }
  }


  private extendOptionsForMiddleware(opts: any) {
    return this.execOnMiddleware('extendOptions', opts);
  }


  private prepareMiddleware(): Promise<any[]> {
    return Promise.all(this.execOnMiddleware('prepare', this._options));
  }


  private useMiddleware(): Promise<any[]> {
    return Promise.all(this.execOnMiddleware('use', this.framework.app()));
  }


  private execOnMiddleware(method: string, ...args: any[]): any[] {
    return this._middlewares.map((m) => {
      if (m[method]) {
        return m[method](...args);
      }
      return null;
    });

  }

  middlewares() {
    return this._middlewares;
  }

  response(req: http.IncomingMessage, res: http.ServerResponse) {
    this.framework.handle(req, res);
  }


  getUri() {
    const o = this.options();
    return o.protocol + '://' + o.ip + (o.port ? ':' + o.port : '');
  }


  getRoutes(): IRoute[] {
    return this.framework.getRoutes();
  }

  start() {
    return super.start();
  }

  stop() {
    return super.stop();
  }

  hasRoutes(): boolean {
    return true;
  }

}
