import {RoutingControllersOptions} from 'routing-controllers';
import {IRouteType} from './IRouteType';

export interface IRoutingController extends RoutingControllersOptions, IRouteType {

  context?: string;

  limit?: number | string;

  access?: { name: string, access: 'deny' | 'allow' }[];

}
