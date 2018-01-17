import * as express from "express";
import {IExpress} from "./IExpress";
import {createExpressServer} from "routing-controllers";
import {IExpressOptions} from "./IExpressOptions";
import {IFrameworkSupport} from "../IFrameworkSupport";
import {Log,TodoException} from "typexs-base";
import {IStaticFiles} from "../../IStaticFiles";


const K_EXPRESS_STATIC = 'static_files';
const K_EXPRESS_ROUTING = 'routing_controller';

export class Express implements IExpress {

  app: express.Application;

  options: IExpressOptions;

  parent: IFrameworkSupport;

  constructor(fw:IFrameworkSupport, options:IExpressOptions) {
    this.options = options;
    this.parent = fw;
    this.app = express();
  }

  prepare(){

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


  }
}
