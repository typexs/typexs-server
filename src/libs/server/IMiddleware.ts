
import {IApplication} from "./IApplication";


export interface IMiddleware {

  validate(cfg:any): boolean;

  prepare():void;

  use(app: IApplication): void;
}
