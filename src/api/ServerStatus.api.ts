import {IServerStatus} from './IServerStatus';
import {IRoute} from '../libs/server/IRoute';


/**
 * Abstract declaration for the api used by invoker
 */
export class ServerStatusApi implements IServerStatus {

  /**
   * Return key list which should be removed before configuration
   * delivered by controller
   */
  filterConfigKeys(): string[] {
    return null;
  }

  /**
   * Gives the possibility to append/change/remove settings in the config object
   * before it is delivered to the frontend
   *
   * @param config
   */
  prepareConfig(config: any, user: any): void {
  }

  /**
   * Gives the possibility to append/change/remove settings in the route objects
   * before they are delivered to the frontend
   * @param routes
   */
  prepareRoutes(routes: IRoute[], user: any): void {
  }

  /**
   * Gives the possibility to append/change/remove settings to the free accessible server status
   * before they are delivered to the frontend
   *
   * @param status
   */
  prepareServerStatus?(status: any, user: any): void {
  }

}
