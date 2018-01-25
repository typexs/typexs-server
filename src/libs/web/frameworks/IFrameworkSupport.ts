import {IRoutingController} from "../IRoutingController";
import {IStaticFiles} from "../IStaticFiles";
import {IApplication} from "./IApplication";
import * as http from "http";



export interface IFrameworkSupport {

  create():IFrameworkSupport;

  useRouteController(options:IRoutingController):IFrameworkSupport;

  useStaticRoute(options:IStaticFiles):IFrameworkSupport;

  app():IApplication;

  handle(req: http.IncomingMessage, res: http.ServerResponse):void;
}
