import {IRoute} from '..';
import {TableMetadataArgs} from 'typeorm/metadata-args/TableMetadataArgs';
import {IModule, IStorageOptions} from '@typexs/base';

/**
 * Interface declaration
 */
export interface IServerNodeInfo {

  /**
   * Return key list which should be removed before configuration
   * delivered by controller
   */
  filterConfigKeys?(): string[];

  /**
   * Gives the possiblity to append/change/remove settings in the config object
   * before it is delivered to the frontend
   *
   * @param config
   */
  prepareConfig?(config: any): void;

  /**
   * Gives the possiblity to append/change/remove settings in the route objects
   * before they are delivered to the frontend
   * @param routes
   */
  prepareRoutes?(routes: IRoute[]): void;

  /**
   * Gives the possiblity to append/change/remove settings in the module objects
   * before they are delivered to the frontend
   * @param modules
   */
  prepareModules?(modules: IModule[]): void;

  /**
   * Gives the possiblity to append/change/remove settings in the storage info objects
   * before there are delivered to the frontend
   * @param options
   */
  prepareStorageInfo?(options: IStorageOptions[]): void;


  /**
   * Gives the possiblity to append/change/remove settings in the storage entities object
   * before they are delivered to the frontend
   *
   * @param config
   */
  prepareStorageEntities?(tables: TableMetadataArgs[]): void;


  /**
   * Gives the possiblity to append/change/remove settings to the free accessible server status
   * before they are delivered to the frontend
   *
   * @param status
   */
  prepareServerStatus?(status: any, user: any): void;

}
