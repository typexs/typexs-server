import * as express from "express";
import * as _ from 'lodash'
import {createExpressServer, useContainer} from "routing-controllers";

import {Server} from "./Server";

import {Container, Log, Runtime, TodoException} from "typexs-base";

import {IStaticFiles} from "./IStaticFiles";
import {DEFAULT_SERVER_OPTIONS, IServerOptions} from "./IServerOptions";


export const K_APPSERVER = 'server';

const K_EXPRESS_STATIC = 'static_files';
const K_EXPRESS_ROUTING = 'routing_controller';

useContainer(Container);

/**
 *
 */

/*
const FIXED_API_OPTIONS: IRoutingController = {

    type: K_EXPRESS_ROUTING,

    routePrefix:'/api',

    controllers: [],

    classTransformer:false

};
*/

export class AppServer extends Server {

  options: IServerOptions;

  app: express.Application;


  constructor(options: IServerOptions) {
    options = _.defaultsDeep(options, DEFAULT_SERVER_OPTIONS);
    super(options);

    //options.routes.unshift(FIXED_API_OPTIONS);
    //options.routes = _.uniq(options.routes)
    this.options = options;


    // TODO
    Runtime.$().setConfig('application', this.options)
  }


  prepare(): Promise<void> {
    this.app = express();
    this.app.disable("x-powered-by");

    /*
    for (let app of this.options.routes) {
      if (app.type == K_EXPRESS_ROUTING) {
        Log.info('add route ' + app.routePrefix, app);
        this.app.use(createExpressServer(app))
      } else if (app.type == K_EXPRESS_STATIC) {
        let _app: IStaticFiles = <IStaticFiles>app;
        if (app.routePrefix) {
          this.app.use(app.routePrefix, express.static(_app.path))
        } else {
          this.app.use(express.static(_app.path))
        }
      } else {
        throw  new TodoException()
      }
    }
    */
    return null
  }

  response(req: express.Request, res: express.Response) {
    this.app(req, res)
  }


}
