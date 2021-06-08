import * as _ from 'lodash';
import {Body, CurrentUser, Delete, Get, HttpError, JsonController, Param, Post, Put, QueryParam} from 'routing-controllers';
import {
  __CLASS__,
  __REGISTRY__,
  Cache,
  ClassLoader,
  IAggregateOptions,
  ICollection,
  IDeleteOptions,
  IEntityController,
  IFindOptions,
  Inject,
  Invoker,
  ISaveOptions,
  IStorageRef,
  IUpdateOptions,
  Log,
  NotYetImplementedError,
  Storage,
  XS_P_$COUNT,
  XS_P_$LIMIT,
  XS_P_$OFFSET
} from '@typexs/base';
import {
  _API_CTRL_STORAGE_AGGREGATE_ENTITY,
  _API_CTRL_STORAGE_DELETE_ENTITIES_BY_CONDITION,
  _API_CTRL_STORAGE_DELETE_ENTITY,
  _API_CTRL_STORAGE_FIND_ENTITY,
  _API_CTRL_STORAGE_GET_ENTITY,
  _API_CTRL_STORAGE_METADATA_ALL_ENTITIES,
  _API_CTRL_STORAGE_METADATA_ALL_STORES,
  _API_CTRL_STORAGE_METADATA_CREATE_ENTITY,
  _API_CTRL_STORAGE_METADATA_GET_ENTITY,
  _API_CTRL_STORAGE_METADATA_GET_STORE,
  _API_CTRL_STORAGE_SAVE_ENTITY,
  _API_CTRL_STORAGE_UPDATE_ENTITIES_BY_CONDITION,
  _API_CTRL_STORAGE_UPDATE_ENTITY,
  API_CTRL_STORAGE_GET_ENTITY,
  API_CTRL_STORAGE_PREFIX,
  C_API,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_ACCESS_STORAGE_METADATA,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN,
  XS_P_$LABEL,
  XS_P_$URL
} from '../libs/Constants';
import {HttpResponseError} from '../libs/exceptions/HttpResponseError';
import {IBuildOptions, IEntityRef, IJsonSchema7, IPropertyRef, JsonSchema} from '@allgemein/schema-api';
import {Expressions} from '@allgemein/expressions';
import {IStorageRefMetadata} from '../libs/storage_api/IStorageRefMetadata';
import {SystemNodeInfoApi} from '../api/SystemNodeInfo.api';
import {StorageAPIControllerApi} from '../api/StorageAPIController.api';
import {JsonUtils, TreeUtils} from '@allgemein/base';
import {ContextGroup} from '../decorators/ContextGroup';
import {Access} from '../decorators/Access';
import {IRolesHolder, PermissionHelper} from '@typexs/roles-api';
import {WalkValues} from '../libs/Helper';
import {isEntityRef} from '@allgemein/schema-api/api/IEntityRef';

@ContextGroup(C_API)
@JsonController(API_CTRL_STORAGE_PREFIX)
export class StorageAPIController {

  @Inject(Storage.NAME)
  storage: Storage;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Inject(Cache.NAME)
  cache: Cache;


  static _beforeBuild(entityRef: IEntityRef, from: any, to: any) {
    _.keys(from).filter(k => k.startsWith('$')).map(k => {
      to[k] = from[k];
    });
  }


  static _afterEntity(entityRef: IEntityRef | IEntityRef[], entity: any[]): void {
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
    const idStr = Expressions.buildLookupConditions(entityRef, e);
    e[XS_P_$URL] = `${API_CTRL_STORAGE_GET_ENTITY}`.replace(':name', entityRef.machineName).replace(':id', idStr);
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
      // const checked = {};
      // _.keys(opts).filter(k => [
      //     'raw',
      //     'timeout',
      //     'validate',
      //     'noTransaction',
      //     'skipBuild'].indexOf(k) > -1 &&
      //   (_.isString(opts[k]) || _.isNumber(opts[k]) || _.isBoolean(opts[k])))
      //   .map(k => checked[k] = opts[k]);
      _.assign(options, opts);
    }
  }

  /**
   * Return list of schemas with their entities
   */
  // @Authorized('read metadata schema')
  // - Check if user has an explicit credential to access the method
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(_API_CTRL_STORAGE_METADATA_ALL_STORES)
  async getMetadatas(@CurrentUser() user: any): Promise<any> {
    const storageNames = this.storage.getNames();
    const data = await Promise.all(_.map(storageNames, storageName => {
      return this.getStorageSchema(storageName);
    }));
    return data;
  }


  /**
   * Return list of entity
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(_API_CTRL_STORAGE_METADATA_GET_STORE)
  async getMetadata(@Param('name') storageName: string,
                    @QueryParam('withCollections') withCollections: boolean,
                    @QueryParam('refresh') refresh: boolean,
                    @CurrentUser() user: any) {
    return this.getStorageSchema(storageName, withCollections, refresh);
  }


  /**
   * Return list of defined entities
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(_API_CTRL_STORAGE_METADATA_ALL_ENTITIES)
  async getMetadataEntities(@CurrentUser() user: any) {
    const storageNames = this.storage.getNames();
    let data: IJsonSchema7[] = [];
    const arrs = await Promise.all(_.map(storageNames, storageName => {
      return this.getStorageSchema(storageName).then(e => e.schema);
    }));
    data = _.concat([], ...arrs);
    return data;
  }


  /**
   * Return list of defined entities
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(_API_CTRL_STORAGE_METADATA_GET_ENTITY)
  async getMetadataEntity(@Param('name') entityName: string, @CurrentUser() user: any) {
    const ref = this.getStorageRef(entityName);
    const entityRef = this.getEntityRef(ref, entityName) as IEntityRef;
    if (_.isArray(entityRef)) {
      throw new Error('multiple entity refs found');
    }

    const entry = JsonSchema.serialize(entityRef, {
      /**
       * Append storageName to entity object
       * @param src
       * @param dst
       */
      postProcess: (src, dst) => {
        if (isEntityRef(src)) {
          dst.storage = ref.getName();
        }
      }
    });
    return entry;
  }


  /**
   * TODO
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Post(_API_CTRL_STORAGE_METADATA_CREATE_ENTITY)
  async entityCreate(@Body() data: any, @CurrentUser() user: any) {
    throw new NotYetImplementedError();
  }

  /**
   * Run a query for entity or an aggregation
   */
  @Access([
    PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
    PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN])
  @Get(_API_CTRL_STORAGE_FIND_ENTITY)
  query(@Param('name') name: string,
        @QueryParam('query') query: string,
        @QueryParam('sort') sort: string = null,
        @QueryParam('limit') limit: number = 50,
        @QueryParam('offset') offset: number = 0,
        @QueryParam('opts') opts: IFindOptions = {},
        @CurrentUser() user: any) {
    return this._query(name, query, null, sort, limit, offset, opts, user);
  }

  /**
   * Run a query for entity or an aggregation
   */
  @Access([
    PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
    PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN])
  @Get(_API_CTRL_STORAGE_AGGREGATE_ENTITY)
  aggregate(@Param('name') name: string,
            @QueryParam('aggr') aggr: string,
            @QueryParam('sort') sort: string = null,
            @QueryParam('limit') limit: number = 50,
            @QueryParam('offset') offset: number = 0,
            @QueryParam('opts') opts: IFindOptions = {},
            @CurrentUser() user: any) {
    return this._query(name, null, aggr, sort, limit, offset, opts, user);
  }

  /**
   * Run a query for entity or an aggregation
   */
  private async _query(
    name: string,
    query: string,
    aggr: string,
    sort: string = null,
    limit: number = 50,
    offset: number = 0,
    opts: IFindOptions = {},
    user: IRolesHolder
  ) {
    const {ref, controller} = this.getControllerForEntityName(name, user);

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
      const options: IAggregateOptions = {
        limit: limit,
        offset: offset,
        sort: sortBy,
      };
      StorageAPIController.checkOptions(opts, options);

      result = await controller.aggregate(
        (_.isArray(ref) ? ref.map(r => r.getClassRef().getClass()) : ref.getClassRef().getClass()) as any,
        conditions,
        options);
    } else {
      const options: IFindOptions = {
        limit: limit,
        offset: offset,
        sort: sortBy,
        // hooks: {afterEntity: StorageAPIController._afterEntity}
      };
      StorageAPIController.checkOptions(opts, options);

      result = await controller.find(
        (_.isArray(ref) ? ref.map(r => r.getClassRef().getClass()) : ref.getClassRef().getClass()) as any,
        conditions,
        options);
      if (!_.isEmpty(result)) {
        StorageAPIController._afterEntity(ref, result);
      }
    }

    const results = {
      entities: result,
      $count: result[XS_P_$COUNT],
      $limit: result[XS_P_$LIMIT],
      $offset: result[XS_P_$OFFSET]
    };

    // pass $dollared key
    _.keys(result).filter(x => _.isString(x) && /^\$/.test(x)).forEach(k => {
      results[k] = result[k];
    });

    // TODO Facets support

    try {
      this.invoker.use(StorageAPIControllerApi)
        .postProcessResults('query', ref, results, {
          name: name,
          query: query,
          aggr: aggr,
          sort: sort,
          limit: limit,
          opts: opts,
          user: user,
          aggregation: aggregationMode
        });
    } catch (e) {
      throw new HttpResponseError(['storage', 'query'], e.message);
    }

    return results;
  }


  /**
   * Return a single Entity
   */
  @Access([
    PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
    PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN])
  @Get(_API_CTRL_STORAGE_GET_ENTITY)
  async get(@Param('name') name: string,
            @Param('id') id: string,
            @QueryParam('opts') opts: IFindOptions = {},
            @CurrentUser() user: any) {
    if (_.isEmpty(name) || _.isEmpty(id)) {
      throw new HttpError(400, 'entity name or id not set');
    }

    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "get"');
    }


    const options: IFindOptions = {
      limit: 0
    };

    StorageAPIController.checkOptions(opts, options);

    let conditions = Expressions.parseLookupConditions(ref, id);

    let result = null;
    if (_.isArray(conditions)) {
      if (conditions.length > 1) {
        // multiple ids should be bound by 'or', else it would be 'and'
        conditions = {$or: conditions};
      }

      result = await controller.find(ref.getClassRef().getClass(), conditions, options);
      StorageAPIController._afterEntity(ref, result);
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
      StorageAPIController._afterEntity(ref, result);
      result = result.shift();
    }

    try {
      this.invoker.use(StorageAPIControllerApi).postProcessResults('get', ref, result, {
        name: name,
        id: id,
        opts: opts,
        user: user,
      });
    } catch (e) {
      throw new HttpResponseError(['storage', 'get'], e.message);
    }
    return result;

  }


  /**
   * Return a new created Entity or executes an update
   */
  @Access([PERMISSION_ALLOW_SAVE_STORAGE_ENTITY, PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN])
  @Post(_API_CTRL_STORAGE_SAVE_ENTITY)
  async save(@Param('name') name: string,
             @Body() data: any,
             @QueryParam('opts') opts: ISaveOptions | IUpdateOptions = {},
             @CurrentUser() user: any): Promise<any> {
    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "save"');
    }
    const options: ISaveOptions = {validate: true};
    StorageAPIController.checkOptions(opts, options);

    const entities = this.prepareEntities(ref, data, options);
    try {
      const results = await controller.save(entities, options);
      this.invoker.use(StorageAPIControllerApi).postProcessResults('save', ref, results, {
        name: name,
        opts: opts,
        user: user,
      });
      return results;
    } catch (e) {
      throw new HttpResponseError(['storage', 'save'], e.message);
    }
  }


  /**
   * Return a updated Entity
   */
  @Access([PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY, PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN])
  @Post(_API_CTRL_STORAGE_UPDATE_ENTITY)
  async updateById(@Param('name') name: string,
                   @Param('id') id: string,
                   @QueryParam('opts') opts: IUpdateOptions = {},
                   @Body() data: any,
                   @CurrentUser() user: any) {

    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "update"');
    }

    const options: ISaveOptions = {validate: true};
    StorageAPIController.checkOptions(opts, options);
    const entities = this.prepareEntities(ref, data, options);

    try {
      const results = await controller.save(entities, options);
      this.invoker.use(StorageAPIControllerApi)
        .postProcessResults('update', ref, results, {
          name: name,
          id: id,
          opts: opts,
          user: user,
        });
      return results;
    } catch (e) {
      throw new HttpResponseError(['storage', 'update'], e.message);
    }
  }

  /**
   * Mas update of data by given query
   */
  @Access([
    PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY,
    PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN])
  @Put(_API_CTRL_STORAGE_UPDATE_ENTITIES_BY_CONDITION)
  async updateByCondition(@Param('name') name: string,
                          @QueryParam('query') query: any = null,
                          @QueryParam('opts') opts: IUpdateOptions = {},
                          @Body() data: any,
                          @CurrentUser() user: any) {
    if (!data) {
      throw new HttpResponseError(['storage', 'update'], 'No update data given');
    }

    if (!query) {
      // select all for change
      query = {};
    }

    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "update"');
    }

    const options: IUpdateOptions = {validate: true};
    StorageAPIController.checkOptions(opts, options);

    try {
      const results = await controller.update(
        ref.getClassRef().getClass(),
        query,
        data,
        options
      );
      this.invoker.use(StorageAPIControllerApi)
        .postProcessResults('update', ref, results, {
          name: name,
          query: query,
          update: data,
          opts: opts,
          user: user,
        });
      return results;
    } catch (e) {
      throw new HttpResponseError(['storage', 'update'], e.message);
    }

  }


  /**
   * Deletes a entity and return removal results
   *
   */
  @Access([PERMISSION_ALLOW_DELETE_STORAGE_ENTITY, PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN])
  @Delete(_API_CTRL_STORAGE_DELETE_ENTITY)
  async deleteById(@Param('name') name: string,
                   @Param('id') id: string,
                   @QueryParam('opts') opts: IDeleteOptions = {},
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

    const options: IDeleteOptions = {};
    StorageAPIController.checkOptions(opts, options);
    try {
      const results = await controller.find(
        ref.getClassRef().getClass(),
        conditions,
        options);

      if (results.length > 0) {
        return controller.remove(results);
      }
      this.invoker.use(StorageAPIControllerApi)
        .postProcessResults('delete', ref, results, {
          name: name,
          id: id,
          opts: opts,
          user: user,
        });
      return results;
    } catch (e) {
      throw new HttpResponseError(['storage', 'delete'], e.message);
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
    PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
    PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN])
  @Delete(_API_CTRL_STORAGE_DELETE_ENTITIES_BY_CONDITION)
  async deleteByQuery(@Param('name') name: string,
                      @QueryParam('query') query: any = {},
                      @QueryParam('opts') opts: IDeleteOptions = {},
                      @CurrentUser() user: any) {

    if (!query || _.isEmpty(query)) {
      // multiple ids should be bound by 'or', else it would be 'and'
      throw new HttpResponseError(['storage', 'delete'], 'query for selection is empty');
    }
    const {ref, controller} = this.getControllerForEntityName(name);
    if (_.isArray(ref)) {
      throw new Error('multiple entity ref are not supported for "update"');
    }
    const options: IDeleteOptions = {};
    StorageAPIController.checkOptions(opts, options);
    try {

      const results = await controller.remove(
        ref.getClassRef().getClass(),
        query,
        options);

      this.invoker.use(StorageAPIControllerApi)
        .postProcessResults('delete', ref, results, {
          name: name,
          query: query,
          opts: opts,
          user: user,
        });
      return results;
    } catch (e) {
      throw new HttpResponseError(['storage', 'delete'], e.message);
    }
  }


  private getControllerForEntityName(name: string, user?: IRolesHolder): { ref: IEntityRef | IEntityRef[], controller: IEntityController } {
    const storageRef = this.getStorageRef(name);
    const controller = storageRef.getController();
    const entityRef = this.getEntityRef(storageRef, name, user);
    return {
      ref: entityRef,
      controller: controller
    };
  }


  private getEntityRef(storageRef: IStorageRef, entityName: string, user?: IRolesHolder): IEntityRef | IEntityRef[] {
    const entityRef = storageRef.getEntityRef(entityName);
    if (!entityRef) {
      throw new HttpResponseError(['storage', 'entity_ref_not_found'], 'Entity reference not found for ' + name);
    }
    if (user && user['getRoles'] && _.isFunction(user['getRoles'])) {
      const isArray = _.isArray(entityRef);
      const entitiesToCheck: IEntityRef[] = isArray ? entityRef as any[] : [entityRef];
      const allowedEntities = [];
      const roles = user.getRoles();
      const permissions = PermissionHelper.getPermissionNamesFromRoles(roles);
      for (const entity of entitiesToCheck) {
        if (PermissionHelper.checkPermission(permissions,
          PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN.replace(':name', entity.machineName))) {
          allowedEntities.push(entity);
        }
      }

      if (allowedEntities.length > 0) {
        if (isArray) {
          return allowedEntities;
        } else {
          return allowedEntities.shift();
        }
      } else {
        throw new HttpResponseError(['storage', 'entity_ref_not_found'], 'Entity reference not found for ' + name + ' or permissions are not given.');
      }


    }
    return entityRef;
  }

  private getStorageRef(entityName: string): IStorageRef {
    const storageRef = this.storage.forClass(entityName);
    if (!storageRef) {
      throw new HttpResponseError(['storage', 'reference_not_found'], 'Storage containing entity ' + name + ' not found');
    }
    return storageRef;
  }


  private prepareEntities(entityDef: IEntityRef, data: any, options: ISaveOptions = {}) {
    const buildOpts: IBuildOptions = {
      beforeBuild: StorageAPIController._beforeBuild
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


  private async getFilterKeys(): Promise<string[]> {
    // TODO cache this!
    const cacheKey = 'storage_filter_keys';
    let filterKeys: string[] = await this.cache.get(cacheKey);
    if (filterKeys) {
      return filterKeys;
    }

    filterKeys = ['user', 'username', 'password'];
    const res: string[][] = <string[][]><any>this.invoker.use(SystemNodeInfoApi).filterConfigKeys();
    if (res && _.isArray(res)) {
      filterKeys = _.uniq(_.concat(filterKeys, ...res.filter(x => _.isArray(x))).filter(x => !_.isEmpty(x)));
    }
    await this.cache.set(cacheKey, filterKeys);
    return filterKeys;
  }

  /**
   * Integrate
   *
   * TODO fetch only if permissions for the entities is set
   *
   * @param storageName
   * @param withCollections
   * @param refresh
   * @param user
   * @private
   */
  private async getStorageSchema(storageName: string, withCollections: boolean = false, refresh: boolean = false, user?: any) {
    const cacheKey = 'storage-schema-' + storageName + (withCollections ? '-with-collection' : '');
    const cacheBin = 'storage-info';

    let entry: IStorageRefMetadata = await this.cache.get(cacheKey, cacheBin);
    if (entry && !refresh) {
      return entry;
    }

    const storageRef = this.storage.get(storageName);
    const options = _.cloneDeepWith(storageRef.getOptions());
    const filterKeys = await this.getFilterKeys();
    TreeUtils.walk(options, (x: WalkValues) => {
      if (_.isString(x.key) && filterKeys.indexOf(x.key) !== -1) {
        delete x.parent[x.key];
      }
      if (_.isFunction(x.value)) {
        if (_.isArray(x.parent)) {
          x.parent[x.index] = ClassLoader.getClassName(x.value);
        } else {
          x.parent[x.key] = ClassLoader.getClassName(x.value);
        }
      }
    });
    entry = {
      name: storageName,
      type: storageRef.getType(),
      framework: storageRef.getFramework(),
      // synchronize: options.synchronize,
      options: options,
      schema: null
    };
    const serializer = JsonSchema.getSerializer({
      /**
       * Append storageName to entity object
       * @param src
       * @param dst
       */
      postProcess: (src, dst) => {
        if (isEntityRef(src)) {
          dst.storage = storageName;
        }
      }
    });
    for (const ref of storageRef.getEntityRefs()) {
      if (ref && isEntityRef(ref)) {
        serializer.serialize(ref);
      }
    }
    entry.schema = serializer.getJsonSchema() ? serializer.getJsonSchema() : {};

    if (withCollections) {
      entry.collections = await this.getStorageRefCollections(storageRef);
    }

    await this.cache.set(cacheKey, entry, cacheBin, {ttl: 24 * 60 * 60 * 1000});
    return entry;
  }


  private async getStorageRefCollections(ref: IStorageRef): Promise<ICollection[]> {
    try {
      const collectionNames = await ref.getRawCollectionNames();
      return await ref.getRawCollections(collectionNames);
    } catch (e) {
      Log.error(e);
    }
    return [];
  }

}
