import * as _ from 'lodash'

import {Server} from "./Server";

import {Container} from "typexs-base";
import {DEFAULT_SERVER_OPTIONS, IServerOptions} from "./IServerOptions";


export const K_APPSERVER = 'server';

import {useContainer} from "routing-controllers";
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



  constructor(options: IServerOptions) {
    options = _.defaultsDeep(options, DEFAULT_SERVER_OPTIONS);
    super(options);

    //options.routes.unshift(FIXED_API_OPTIONS);
    //options.routes = _.uniq(options.routes)
    this.options = options;

  }


  prepare(): Promise<void> {

    /*
    */
    return null
  }

  /*
  response(req: express.Request, res: express.Response) {
    this.app(req, res)
  }
  */


}
