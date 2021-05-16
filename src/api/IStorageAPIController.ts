import {IEntityRef} from '@allgemein/schema-api';

export type STORAGE_API_CONTROLLER_STATE = 'get' | 'query' | 'save' | 'update' | 'delete';

/**
 * Interface declaration
 */
export interface IStorageAPIController {

  // /**
  //  * Allow to modify incoming parameter for get, query, save and update calls.
  //  *
  //  * @param state - which method called
  //  * @param entityRef - definition of the entities
  //  * @param callOptions - is a map with => paramName to value
  //  */
  // prepareParams?(state: STORAGE_API_CONTROLLER_STATE, entityRef: IEntityRef, callOptions?: any): void;

  /**
   * Allow to post process early produced results for get, query, save and update calls.
   *
   * @param state - which method called
   * @param entityRef - definition of the entities
   * @param results - can be array or single entity
   * @param callOptions - is a map with => paramName to value
   */
  postProcessResults?(state: STORAGE_API_CONTROLLER_STATE,
                      entityRef: IEntityRef | IEntityRef[],
                      results: any | any[],
                      callOptions?: any): void;


}
