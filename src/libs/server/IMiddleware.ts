import {IApplication} from "./IApplication";
import {ROUTE} from "../../types";


export interface IMiddleware {

  validate(cfg: any): boolean;

  prepare?(options: any): void;

  extendOptions?(usedAppOptions: ROUTE): void;

  use(app: IApplication): void;
}
