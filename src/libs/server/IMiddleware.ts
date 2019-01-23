import {IApplication} from "./IApplication";
import {ROUTE} from "../Constants";


export interface IMiddleware {

  validate(cfg: any): boolean;

  prepare?(options: any): void;

  extendOptions?(usedAppOptions: ROUTE): void;

  use(app: IApplication): void;
}
