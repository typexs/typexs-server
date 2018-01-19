import * as express from "express";

import {createExpressServer} from "routing-controllers";
import {IStaticFiles} from "../../IStaticFiles";
import {IRoutingController} from "../../IRoutingController";
import {IFrameworkSupport} from "../IFrameworkSupport";
import {IApplication} from "../IApplication";
import * as http from "http";


export class Express implements IFrameworkSupport {

  _app: express.Application;



  create(){
    this._app = express();
    return this;
  }


  useRouteController(options:IRoutingController){
    this.app().use(createExpressServer(options));
    return this;
  }

  useStaticRoute(options:IStaticFiles){
    if(options.routePrefix){
      this.app().use(options.routePrefix,express.static(options.path));
    }else{
      this.app().use(express.static(options.path));
    }
    return this;
  }

  // TODO
  useMiddleware(){
    this._app.use
  }



  app():IApplication{
    if(!this._app){
      throw new Error('app not created');
    }
    return this._app;
  }


  handle(req: http.IncomingMessage, res: http.ServerResponse){
    this._app(req,res);
  }
}
