import *as _ from 'lodash';
import {Body, CurrentUser, Delete, Get, JsonController, Param, Post, QueryParam} from "routing-controllers";
import {
  Inject, Invoker, NotYetImplementedError, Storage, StorageRef,
  XS_P_$COUNT, XS_P_$LIMIT, XS_P_$OFFSET,Log
} from "@typexs/base";
import {StorageEntityController} from '@typexs/base/libs/storage/StorageEntityController'
import {
  Access,
  API_STORAGE_DELETE_ENTITY,
  API_STORAGE_FIND_ENTITY,
  API_STORAGE_GET_ENTITY,
  API_STORAGE_METADATA_ALL_ENTITIES,
  API_STORAGE_METADATA_ALL_STORES,
  API_STORAGE_METADATA_CREATE_ENTITY,
  API_STORAGE_METADATA_GET_ENTITY,
  API_STORAGE_METADATA_GET_STORE,
  API_STORAGE_PREFIX,
  API_STORAGE_SAVE_ENTITY,
  API_STORAGE_UPDATE_ENTITY,
  ContextGroup,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_ACCESS_STORAGE_METADATA,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN, XS_P_LABEL, XS_P_URL
} from "..";
import {HttpResponseError} from "../libs/exceptions/HttpResponseError";
import {IEntityRef} from 'commons-schema-api';
import {Expressions} from 'commons-expressions';


@ContextGroup('api')
@JsonController(API_STORAGE_PREFIX)
export class StorageAPIController {

  @Inject(Storage.NAME)
  storage: Storage;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  /**
   * Return list of schemas with their entities
   */
  // @Authorized('read metadata schema')
  // - Check if user has an explicit credential to access the method
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(API_STORAGE_METADATA_ALL_STORES)
  async getMetadatas(@CurrentUser() user: any): Promise<any> {
    let storageNames = this.storage.getNames();
    let data = [];


    throw new NotYetImplementedError()
  }

  /**
   * Return list of entity
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(API_STORAGE_METADATA_GET_STORE)
  async getMetadata(@Param('name') schemaName: string, @CurrentUser() user: any) {
    throw new NotYetImplementedError()
  }


  /**
   * Return list of defined entities
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(API_STORAGE_METADATA_ALL_ENTITIES)
  async getMetadataEntities(@CurrentUser() user: any) {
    throw new NotYetImplementedError()
  }


  /**
   * Return list of defined entities
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(API_STORAGE_METADATA_GET_ENTITY)
  async getMetadataEntity(@Param('entityName') entityName: string, @CurrentUser() user: any) {
    throw new NotYetImplementedError()
  }


  /**
   * Return list of defined entities
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Post(API_STORAGE_METADATA_CREATE_ENTITY)
  async entityCreate(@Body() data: any, @CurrentUser() user: any) {
    throw new NotYetImplementedError()
  }


  /**
   * Run a query for entity
   */
  @Access([PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY, PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN])
  @Get(API_STORAGE_FIND_ENTITY)
  async query(
    @Param('name') name: string,
    @QueryParam('query') query: string,
    @QueryParam('sort') sort: string,
    @QueryParam('limit') limit: number = 50,
    @QueryParam('offset') offset: number = 0,
    @CurrentUser() user: any
  ) {

    let [entityRef,controller] = this.getControllerForEntityName(name);

    let conditions = null;
    if (query) {
      conditions = JSON.parse(query);
      if (!_.isPlainObject(conditions)) {
        throw new Error('conditions are wrong ' + query);
      }
    }
    let sortBy = null;
    if (sort) {
      sortBy = JSON.parse(sort);
      if (!_.isPlainObject(sortBy)) {
        throw new Error('sort by is wrong ' + sort);
      }
    }

    if (!_.isNumber(limit)) {
      limit = 50;
    }

    if (!_.isNumber(offset)) {
      offset = 0;
    }

    let result = await controller.find(entityRef.getClassRef().getClass(), conditions, {
      limit: limit,
      offset: offset,
      sort: sortBy,
      //hooks: {afterEntity: StorageAPIController._afterEntity}
    });

    if (!_.isEmpty(result)) {
      StorageAPIController._afterEntity(entityRef, result);
    }

    return {
      entities: result,
      $count: result[XS_P_$COUNT],
      $limit: result[XS_P_$LIMIT],
      $offset: result[XS_P_$OFFSET]
    }
  }


  /**
   * Return a single Entity
   */
  @Access([PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY, PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN])
  @Get(API_STORAGE_GET_ENTITY)
  async get(@Param('name') name: string, @Param('id') id: string, @CurrentUser() user: any) {
    const [entityRef,controller] = this.getControllerForEntityName(name);

    const conditions = Expressions.parseLookupConditions(entityRef,id);
    let result = null;
    if (_.isArray(conditions)) {
      result = await controller.find(entityRef.getClassRef().getClass(), conditions, {

      });
      let results = {
        entities: StorageAPIController._afterEntity(entityRef,result),
        $count: result[XS_P_$COUNT],
        $limit: result[XS_P_$LIMIT],
        $offset: result[XS_P_$OFFSET]
      }
      result = results;
    } else {
      result = await controller.find(entityRef.getClassRef().getClass(), conditions, {
        limit: 1
      });
      StorageAPIController._afterEntity(entityRef,result);
      result = result.shift();
    }
    return result;

  }


  /**
   * Return a new created Entity
   */
  @Access([PERMISSION_ALLOW_SAVE_STORAGE_ENTITY, PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN])
  @Post(API_STORAGE_SAVE_ENTITY)
  async save(@Param('name') name: string, @Body() data: any, @CurrentUser() user: any): Promise<any> {

    const [entityDef, controller] = this.getControllerForEntityName(name);
    //await this.invoker.use(EntityControllerApi).beforeEntityBuild(entityDef, data, user, controller);
    let entities;
    if (_.isArray(data)) {
      entities = _.map(data, d => entityDef.build(d, {beforeBuild: StorageAPIController._beforeBuild}));
    } else {
      entities = entityDef.build(data, {beforeBuild: StorageAPIController._beforeBuild});
    }
    //await this.invoker.use(EntityControllerApi).afterEntityBuild(entityDef, entities, user, controller);
    return controller.save(entities).catch((e:Error) => {
      Log.error(e);
      throw new HttpResponseError(['storage','save'],e.message);
    });
  }


  /**
   * Return a updated Entity
   */
  @Access([PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY, PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN])
  @Post(API_STORAGE_UPDATE_ENTITY)
  async update(@Param('name') name: string, @Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {

    const [entityDef, controller] = this.getControllerForEntityName(name);
    //await this.invoker.use(EntityControllerApi).beforeEntityBuild(entityDef, data, user, controller);
    let entities;
    if (_.isArray(data)) {
      entities = _.map(data, d => entityDef.build(d, {beforeBuild: StorageAPIController._beforeBuild}));
    } else {
      entities = entityDef.build(data, {beforeBuild: StorageAPIController._beforeBuild});
    }
    //await this.invoker.use(EntityControllerApi).afterEntityBuild(entityDef, entities, user, controller);
    return controller.save(entities).catch((e:Error) => {
      Log.error(e);
      throw new HttpResponseError(['storage','save'],e.message);
    });
  }


  /**
   * Return a deleted Entity
   */
  @Access([PERMISSION_ALLOW_DELETE_STORAGE_ENTITY, PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN])
  @Delete(API_STORAGE_DELETE_ENTITY)
  async delete(@Param('name') name: string, @Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    const [entityDef, controller] = this.getControllerForEntityName(name);
    const conditions = Expressions.parseLookupConditions(entityDef,id);
    let results = await controller.find(entityDef.getClassRef().getClass(), conditions);
    if (results.length > 0) {
      return controller.remove(results);
    }
    return null;
  }




  private getControllerForEntityName(name: string): [IEntityRef, StorageEntityController] {
    const storageRef = this.getStorageRef(name);
    let controller = storageRef.getController();
    let entityRef = storageRef.getEntityRef(name);
    if (!entityRef) {
      throw new HttpResponseError(['storage', 'entity_ref_not_found'], 'Entity reference not found for ' + name)
    }
    return [entityRef, controller];
  }


  private getStorageRef(entityName: string): StorageRef {
    let storageRef = this.storage.forClass(name);
    if (!storageRef) {
      throw new HttpResponseError(['storage', 'reference_not_found'], 'Storage containing entity ' + name + ' not found')
    }
    return storageRef;
  }

  static _beforeBuild(entityDef: IEntityRef, from: any, to: any) {
    _.keys(from).filter(k => k.startsWith('$')).map(k => {
      to[k] = from[k];
    })
  }

  static _afterEntity(entityDef: IEntityRef, entity: any[]): void {
    let props = entityDef.getPropertyRefs().filter(id => id.isIdentifier());
    entity.forEach(e => {
      let idStr = Expressions.buildLookupConditions(entityDef, e);
      let url = `api/${API_STORAGE_PREFIX}/entity/${entityDef.machineName}/${idStr}`;
      e[XS_P_URL] = url;
      e[XS_P_LABEL] = _.isFunction(e.label) ? e.label() : _.map(props, p => p.get(e)).join(' ');
    });
  }

}
