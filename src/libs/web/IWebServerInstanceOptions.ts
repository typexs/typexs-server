import {IServerOptions} from "../server/IServerOptions";
import {ROUTE} from "../Constants";
import {IServerInstanceOptions} from "../server/IServerInstanceOptions";

export interface IWebServerInstanceOptions extends IServerOptions, IServerInstanceOptions {

  framework: 'express' | Function;

  routes: ROUTE [];

}
