import {IStorageAPIController, STORAGE_API_CONTROLLER_STATE} from './IStorageAPIController';
import {IEntityRef} from '@allgemein/schema-api';


/**
 * API Declaration for invoker
 *
 *
 * Usage:
 * ```
 * // Create a typescript file in "src/extend/" or "extend/" directory in your project
 * // and fill it with following content:
 *
 * @Api(StorageAPIControllerApi)
 * export class MyStorageAPIControllerApiExtension implements IStorageAPIController {
 *   postProcessResults(state: STORAGE_API_CONTROLLER_STATE, entityRef: IEntityRef, results: any | any[], callOptions?: any): void {
 *      if(state === 'get' && entityRef.name === 'MyEntity' && !_.isEmpty(results)){
 *          if(_.isArray(results)){
 *              results.forEach(r => {r.isMine = true})
 *          }else{
 *              results.isMine = true;
 *          }
 *      }
 *   }
 * }
 * ```
 */
export class StorageAPIControllerApi implements IStorageAPIController {

  // /**
  //  * Allow to modify incoming parameter for get, query, save and update calls.
  //  *
  //  * @param state - which method called
  //  * @param entityRef - definition of the entities
  //  * @param callOptions - is a map with => paramName to value
  //  */
  // prepareParams(state: STORAGE_API_CONTROLLER_STATE, entityRef: IEntityRef, callOptions?: any): void {
  // }

  /**
   * Allow to post process early produced results for get, query, save and update calls.
   *
   * @param state - which method called
   * @param entityRef - definition of the entities
   * @param results - can be array or single entity
   * @param callOptions - is a map with => paramName to value
   */
  postProcessResults(state: STORAGE_API_CONTROLLER_STATE,
                     entityRef: IEntityRef | IEntityRef[],
                     results: any | any[],
                     callOptions?: any): void {
  }

}
