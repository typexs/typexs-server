import {IRouteType} from './IRouteType';

export interface IStaticFiles extends IRouteType {
  routePrefix?: string;
  path: string;
  defaultFile?: string;
}
