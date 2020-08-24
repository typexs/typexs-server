import {TableMetadataArgs} from 'typeorm/metadata-args/TableMetadataArgs';

import {IModule, IStorageOptions} from '@typexs/base';
import {ISystemNodeInfo} from './ISystemNodeInfo';
import {IRoute} from '../libs/server/IRoute';


/**
 * Abstract declaration for the api used by invoker
 */
export class SystemNodeInfoApi implements ISystemNodeInfo {

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
  prepareConfig(config: any): void {
  }

  /**
   * Gives the possibility to append/change/remove settings in the route objects
   * before they are delivered to the frontend
   * @param routes
   */
  prepareRoutes(routes: IRoute[], user: any): void {
  }

  /**
   * Gives the possibility to append/change/remove settings in the module objects
   * before they are delivered to the frontend
   * @param modules
   */
  prepareModules(modules: IModule[]): void {
  }

  /**
   * Gives the possibility to append/change/remove settings in the storage info objects
   * before there are delivered to the frontend
   * @param options
   */
  prepareStorageInfo(options: IStorageOptions[]) {
  }

  /**
   * Gives the possibility to append/change/remove settings in the storage entities object
   * before they are delivered to the frontend
   *
   * @param config
   */
  prepareStorageEntities(tables: TableMetadataArgs[]): void {
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
