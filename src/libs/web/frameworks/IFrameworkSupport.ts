import {IRoutingController} from '../IRoutingController';
import {IStaticFiles} from '../IStaticFiles';
import {IApplication} from '../../server/IApplication';
import * as http from 'http';
import {IRoute} from '../../server/IRoute';


export interface IFrameworkSupport {

  create(): IFrameworkSupport;

  useRouteController(options: IRoutingController): IFrameworkSupport;

  useStaticRoute(options: IStaticFiles): IFrameworkSupport;

  app(): IApplication;

  handle(req: http.IncomingMessage, res: http.ServerResponse): void;

  getRoutes(): IRoute[];
}
