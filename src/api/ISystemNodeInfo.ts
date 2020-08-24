import {TableMetadataArgs} from 'typeorm/metadata-args/TableMetadataArgs';
import {IModule, IStorageOptions} from '@typexs/base';

/**
 * Interface declaration
 */
export interface ISystemNodeInfo {



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


}
