import * as _ from 'lodash';
import {Body, CurrentUser, Delete, Get, JsonController, Param, Post, Put, QueryParam} from 'routing-controllers';
import {
  __CLASS__,
  __REGISTRY__,
  Cache,
  DistributedStorageEntityController,
  IDistributedAggregateOptions,
  IDistributedFindOptions,
  IDistributedRemoveOptions,
  IDistributedSaveOptions,
  IDistributedUpdateOptions,
  Inject,
  Invoker,
  ISaveOptions,
  IStorageRef,
  IUpdateOptions,
  Log,
  Storage,
  XS_P_$COUNT,
  XS_P_$LIMIT,
  XS_P_$OFFSET
} from '@typexs/base';
import {
  _API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITIES_BY_CONDITION,
  _API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITY,
  _API_CTRL_DISTRIBUTED_STORAGE_FIND_ENTITY,
  _API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY,
  _API_CTRL_DISTRIBUTED_STORAGE_SAVE_ENTITY,
  _API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITIES_BY_CONDITION,
  _API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITY,
  API_CTRL_DISTRIBUTED_STORAGE,
  API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY,
  C_API,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY_PATTERN,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY_PATTERN,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY_PATTERN,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY_PATTERN,
  XS_P_$LABEL,
  XS_P_$URL
} from '../libs/Constants';
import {HttpResponseError} from '../libs/exceptions/HttpResponseError';
import {IBuildOptions, IEntityRef, IPropertyRef} from '@allgemein/schema-api';
import {Expressions} from '@allgemein/expressions';
import {JsonUtils} from '@allgemein/base';

import {ContextGroup} from '../decorators/ContextGroup';
import {Access} from '../decorators/Access';

/**
 * Distributed storage controller executes requests to nodes with activated
 * distributed query workers
 */
@ContextGroup(C_API)
@JsonController(API_CTRL_DISTRIBUTED_STORAGE)
export class DistributedStorageAPIController {

  @Inject(Storage.NAME)
  storage: Storage;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Inject(Cache.NAME)
  cache: Cache;

  @Inject()
  controller: DistributedStorageEntityController;

  static _afterEntity(entityRef: IEntityRef | IEntityRef[], entity: any[]): void {
    // const props = entityDef.getPropertyRefs().filter(id => id.isIdentifier());
    // entity.forEach(e => {
    //   const idStr = Expressions.buildLookupConditions(entityDef, e);
    //   const nodeId = e.__nodeId__;
    //   const url = `${API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY}`
    //     .replace(':name', entityDef.machineName)
    //     .replace(':id', idStr)
    //     .replace(':nodeId', nodeId);
    //   e[XS_P_$URL] = url;
    //   e[XS_P_$LABEL] = _.isFunction(e.label) ? e.label() : _.map(props, p => p.get(e)).join(' ');
    // });

    if (_.isArray(entityRef)) {
      entity.forEach(e => {
        const _entityRef = entityRef.find(x => x.isOf(e));
        const props = _entityRef.getPropertyRefs().filter(id => id.isIdentifier());
        this.addMeta(_entityRef, e, props);
      });
    } else {
      const props = entityRef.getPropertyRefs().filter(id => id.isIdentifier());
      entity.forEach(e => {
        this.addMeta(entityRef, e, props);
      });
    }
  }


  private static addMeta(entityRef: IEntityRef, e: any, props: IPropertyRef[]) {
    const nodeId = e.__nodeId__;
    const idStr = Expressions.buildLookupConditions(entityRef, e);
    const url = `${API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY}`
      .replace(':name', entityRef.machineName)
      .replace(':id', idStr)
      .replace(':nodeId', nodeId);
    e[XS_P_$URL] = url;
    e[XS_P_$LABEL] = _.isFunction(e.label) ? e.label() : _.map(props, p => p.get(e)).join(' ');
    if (!e[__CLASS__]) {
      e[__CLASS__] = entityRef.name;
    }
    if (!e[__REGISTRY__]) {
      e[__REGISTRY__] = entityRef.getNamespace();
    }

  }


  static checkOptions(opts: any, options: any) {
    if (!_.isEmpty(opts)) {
      const checked = {};
      _.keys(opts).filter(k => [
          'raw',
          'timeout',
          'validate',
          'noTransaction',
          'skipBuild',
          'hint',
          'contollerHint',
          'timeout',
          'cache',
          'skipLocal',
          'outputMode',
          'targetIds',
          'filterErrors'
        ].indexOf(k) > -1 &&
        (_.isString(opts[k]) ||
          _.isNumber(opts[k]) ||
          _.isPlainObject(opts[k]) ||
          _.isBoolean(opts[k])))
        .map(k => checked[k] = opts[k]);
      _.assign(options, opts);
    }
  }

  static _beforeBuild(entityDef: IEntityRef, from: any, to: any) {
    _.keys(from).filter(k => k.startsWith('$')).map(k => {
      to[k] = from[k];
    });
  }


  /**
   * Run a query for entity or an aggregation
   */
  @Access([
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY,
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY_PATTERN
  ])
  @Get(_API_CTRL_DISTRIBUTED_STORAGE_FIND_ENTITY)
  async query(
    @Param('name') name: string,
    @QueryParam('query') query: string,
    @QueryParam('aggr') aggr: string,
    @QueryParam('sort') sort: string = null,
    @QueryParam('limit') limit: number = 50,
    @QueryParam('offset') offset: number = 0,
    @QueryParam('opts') opts: IDistributedFindOptions | IDistributedAggregateOptions = {},
    @CurrentUser() user: any
  ) {
    const {ref, controller} = this.getControllerForEntityName(name);

    if (!_.isNumber(limit)) {
      limit = 50;
    }

    if (!_.isNumber(offset)) {
      offset = 0;
    }

    const aggregationMode = !!aggr && !_.isEmpty(aggr);

    let conditions: any = aggregationMode ? aggr : query;
    if (conditions) {
      conditions = JsonUtils.parse(conditions);
      if (
        !_.isPlainObject(conditions) &&
        !_.isArray(conditions)
      ) {
        throw new Error('conditions are wrong ' + conditions);
      }
    }

    let sortBy = null;
    if (sort) {
      sortBy = JsonUtils.parse(sort);
      if (!_.isPlainObject(sortBy)) {
        throw new Error('sort by is wrong ' + sort);
      }
    }

    let result: any = null;
    if (aggr && !_.isEmpty(aggr)) {
      const options: IDistributedAggregateOptions = {
        limit: limit,
        offset: offset,
        sort: sortBy,
      };
      DistributedStorageAPIController.checkOptions(opts, options);

      result = await controller.aggregate(
        (_.isArray(ref) ? ref.map(r => r.getClassRef().getClass()) : ref.getClassRef().getClass()) as any,
        conditions,
        options);
    } else {
      const options: IDistributedFindOptions = {
        limit: limit,
        offset: offset,
        sort: sortBy,
        // hooks: {afterEntity: DistributedStorageAPIController._afterEntity}
      };
      DistributedStorageAPIController.checkOptions(opts, options);

      result = await controller.find(
        (_.isArray(ref) ? ref.map(r => r.getClassRef().getClass()) : ref.getClassRef().getClass()) as any,
        conditions,
        options);
      if (!_.isEmpty(result)) {
        DistributedStorageAPIController._afterEntity(ref, result);
      }
    }

    const results = {
      entities: result,
      $count: result[XS_P_$COUNT],
      $limit: result[XS_P_$LIMIT],
      $offset: result[XS_P_$OFFSET]
    };
    // pass $dollared key
    if (result) {
      _.keys(result).filter(x => _.isString(x) && /^\$/.test(x)).forEach(k => {
        results[k] = result[k];
      });
    }
    return results;
  }


  /**
   * Return a single Entity
   */
  @Access([
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY,
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY_PATTERN])
  @Get(_API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY)
  async get(@Param('name') name: string,
            @Param('nodeId') targetId: string,
            @Param('id') id: string,
            @QueryParam('opts') opts: IDistributedFindOptions = {},
            @CurrentUser() user: any) {
    if (_.isEmpty(name) || _.isEmpty(id)) {
      throw new HttpResponseError(['distributed_storage', 'find'], 'Entity name or id not set');
    }
    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "save"');
    }
    const options: IDistributedFindOptions = {limit: 50};
    DistributedStorageAPIController.checkOptions(opts, options);
    if (!options.targetIds) {
      options.targetIds = [targetId];
    }

    let conditions = Expressions.parseLookupConditions(ref, id);

    let result = null;
    if (_.isArray(conditions)) {
      if (conditions.length > 1) {
        // multiple ids should be bound by 'or', else it would be 'and'
        conditions = {$or: conditions};
      }

      result = await controller.find(
        ref.getClassRef().getClass(), conditions, options);
      DistributedStorageAPIController._afterEntity(ref, result);
      const results = {
        entities: result,
        $count: result[XS_P_$COUNT],
        $limit: result[XS_P_$LIMIT],
        $offset: result[XS_P_$OFFSET]
      };
      result = results;
    } else {
      options.limit = 1;
      result = await controller.find(ref.getClassRef().getClass(), conditions, options);
      DistributedStorageAPIController._afterEntity(ref, result);
      result = result.shift();
    }

    return result;

  }


  /**
   * Return a new created Entity or executes an update
   */
  @Access([
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY,
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY_PATTERN
  ])
  @Post(_API_CTRL_DISTRIBUTED_STORAGE_SAVE_ENTITY)
  async save(@Param('name') name: string,
             @Param('nodeId') targetId: string,
             @Body() data: any,
             @QueryParam('opts') opts: ISaveOptions | IUpdateOptions = {},
             @CurrentUser() user: any): Promise<any> {
    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "save"');
    }
    const options: IDistributedSaveOptions = {validate: true};
    DistributedStorageAPIController.checkOptions(opts, options);
    if (!options.targetIds) {
      options.targetIds = [targetId];
    }
    const entities = this.prepareEntities(ref, data, options);
    try {
      const results = await controller.save(entities, options);
      return results;
    } catch (e) {
      Log.error(e);
      throw new HttpResponseError(['distributed_storage', 'save'], e.message);
    }
  }


  /**
   * Return a updated Entity
   */
  @Access([
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY,
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY_PATTERN
  ])
  @Post(_API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITY)
  async updateById(@Param('name') name: string,
                   @Param('nodeId') targetId: string,
                   @Param('id') id: string,
                   @QueryParam('opts') opts: IDistributedUpdateOptions = {},
                   @Body() data: any,
                   @CurrentUser() user: any) {

    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "update"');
    }
    // let conditions = Expressions.parseLookupConditions(entityDef, id);
    // if (conditions.length > 1) {
    //   // multiple ids should be bound by 'or', else it would be 'and'
    //   conditions = {$or: conditions};
    // }
    const options: IDistributedUpdateOptions = {};
    DistributedStorageAPIController.checkOptions(opts, options);
    if (!options.targetIds) {
      options.targetIds = [targetId];
    }
    const entities = this.prepareEntities(ref, data, options);

    try {
      const results = await controller.save(entities, options);
      return results;
    } catch (e) {
      Log.error(e);
      throw new HttpResponseError(['distributed_storage', 'update'], e.message);
    }
  }

  /**
   * Mas update of data by given query
   */
  @Access([
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY,
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY_PATTERN
  ])
  @Put(_API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITIES_BY_CONDITION)
  async updateByCondition(@Param('name') name: string,
                          @Param('nodeId') targetId: string,
                          @QueryParam('query') query: any = null,
                          @QueryParam('opts') opts: IUpdateOptions = {},
                          @Body() data: any,
                          @CurrentUser() user: any) {
    if (!data) {
      throw new HttpResponseError(['distributed_storage', 'update'], 'No update data given');
    }

    if (!query) {
      // select all for change
      query = {};
    }

    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "update"');
    }
    const options: IDistributedUpdateOptions = {};
    DistributedStorageAPIController.checkOptions(opts, options);
    if (!options.targetIds) {
      options.targetIds = [targetId];
    }
    try {
      const results = await controller.update(
        ref.getClassRef().getClass() as any,
        query,
        data,
        options
      );

      return results;
    } catch (e) {
      Log.error(e);
      throw new HttpResponseError(['distributed_storage', 'update'], e.message);
    }

  }


  /**
   * Deletes a entity and return removal results
   *
   */
  @Access([
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY,
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY_PATTERN
  ])
  @Delete(_API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITY)
  async deleteById(@Param('name') name: string,
                   @Param('nodeId') targetId: string,
                   @Param('id') id: string,
                   @QueryParam('opts') opts: IDistributedRemoveOptions = {},
                   @Body() data: any,
                   @CurrentUser() user: any) {
    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "delete"');
    }
    let conditions = Expressions.parseLookupConditions(ref, id);
    if (conditions.length > 1) {
      // multiple ids should be bound by 'or', else it would be 'and'
      conditions = {$or: conditions};
    }

    const options: IDistributedRemoveOptions = {};
    DistributedStorageAPIController.checkOptions(opts, options);
    if (!options.targetIds) {
      options.targetIds = [targetId];
    }
    const results = await controller.find(
      ref.getClassRef().getClass(),
      conditions,
      options);

    if (results.length > 0) {
      return controller.remove(results, options);
    }
    return 0;
  }


  /**
   * Delete records by conditions

   * @param name
   * @param id
   * @param opts
   * @param data
   * @param user
   */
  @Access([
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY,
    PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY_PATTERN
  ])
  @Delete(_API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITIES_BY_CONDITION)
  async deleteByQuery(@Param('name') name: string,
                      @Param('nodeId') targetId: string,
                      @QueryParam('query') query: any = {},
                      @QueryParam('opts') opts: IDistributedRemoveOptions = {},
                      @CurrentUser() user: any) {

    if (!query || _.isEmpty(query)) {
      // multiple ids should be bound by 'or', else it would be 'and'
      throw new HttpResponseError(['distributed_storage', 'delete'], 'query for selection is empty');
    }
    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "delete"');
    }
    const options: IDistributedRemoveOptions = {};
    DistributedStorageAPIController.checkOptions(opts, options);
    if (!options.targetIds) {
      options.targetIds = [targetId];
    }

    return await controller.remove(
      ref.getClassRef().getClass() as any,
      query,
      options);
  }


  private getControllerForEntityName(name: string): { ref: IEntityRef | IEntityRef[], controller: DistributedStorageEntityController } {
    const storageRef = this.getStorageRef(name);
    const entityRef = this.getEntityRef(storageRef, name);
    return {ref: entityRef, controller: this.controller};
  }


  private getEntityRef(storageRef: IStorageRef, entityName: string): IEntityRef | IEntityRef[] {
    const entityRef = storageRef.getEntityRef(entityName);
    if (!entityRef) {
      throw new HttpResponseError(['distributed_storage', 'entity_ref_not_found'], 'Entity reference not found for ' + name);
    }
    return entityRef;
  }


  private getStorageRef(entityName: string): IStorageRef {
    const storageRef = this.storage.forClass(entityName);
    if (!storageRef) {
      throw new HttpResponseError(['distributed_storage', 'reference_not_found'],
        'Storage containing entity ' + entityName + ' not found');
    }
    return storageRef;
  }


  private prepareEntities(entityDef: IEntityRef, data: any, options: IDistributedSaveOptions = {}) {
    const buildOpts: IBuildOptions = {
      beforeBuild: DistributedStorageAPIController._beforeBuild
    };
    if (options.raw) {
      buildOpts.createAndCopy = options.raw;
    }
    let entities;
    if (_.isArray(data)) {
      entities = _.map(data, d => entityDef.build(d, buildOpts));
    } else {
      entities = entityDef.build(data, buildOpts);
    }
    return entities;
  }

}
