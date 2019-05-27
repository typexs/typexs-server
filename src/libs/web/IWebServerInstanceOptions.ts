import {IServerOptions} from '../server/IServerOptions';

import {IServerInstanceOptions} from '../server/IServerInstanceOptions';
import {IRoutingController} from './IRoutingController';
import {IStaticFiles} from './IStaticFiles';

export type ROUTE = IRoutingController | IStaticFiles;


export interface IWebServerInstanceOptions extends IServerOptions, IServerInstanceOptions {

  framework: 'express' | Function;

  routes: ROUTE [];

}
