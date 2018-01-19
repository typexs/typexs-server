import {IFrameworkSupport} from "../IFrameworkSupport";
import {IStaticFiles} from "../../IStaticFiles";
import {IRoutingController} from "../../IRoutingController";
import {IApplication} from "../IApplication";
import * as http from "http";


export class ExpressSupport implements IFrameworkSupport {

  static LIB: Function;

  wrapper: IFrameworkSupport;


  create(){
    ExpressSupport.LIB = require('./Express');
    this.wrapper = Reflect.construct(ExpressSupport.LIB, []);
    //  this.app.disable("x-powered-by");
    this.wrapper.create();
    return this;
  }

  useRouteController(options:IRoutingController){
    this.wrapper.useRouteController(options);
    return this;
  }

  useStaticRoute(options:IStaticFiles){
    this.wrapper.useRouteController(options);
    return this;
  }

  handle(req: http.IncomingMessage, res: http.ServerResponse){
    this.wrapper.handle(req,res);
  }


  app():IApplication {
    return this.wrapper.app();
  }

}
