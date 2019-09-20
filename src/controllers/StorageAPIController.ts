import * as _ from 'lodash';
import {Body, CurrentUser, Delete, Get, HttpError, JsonController, Param, Post, QueryParam} from 'routing-controllers';
import {
  Cache,
  ClassLoader,
  ICollection,
  IFindOptions,
  Inject,
  Invoker,
  ISaveOptions,
  Log,
  NotYetImplementedError,
  Storage,
  StorageEntityController,
  StorageRef,
  TreeUtils,
  WalkValues,
  XS_P_$COUNT,
  XS_P_$LIMIT,
  XS_P_$OFFSET
} from '@typexs/base';
import {EntitySchema} from 'typeorm';
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
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN,
  XS_P_LABEL,
  XS_P_URL
} from '..';
import {HttpResponseError} from '../libs/exceptions/HttpResponseError';
import {IEntityRef, IEntityRefMetadata} from 'commons-schema-api';
import {Expressions} from 'commons-expressions';
import {IStorageRefMetadata} from '../libs/storage_api/IStorageRefMetadata';
import {ServerNodeInfoApi} from '../api/ServerNodeInfo.api';
import {StorageAPIControllerApi} from '../api/StorageAPIController.api';


@ContextGroup('api')
@JsonController(API_STORAGE_PREFIX)
export class StorageAPIController {

  @Inject(Storage.NAME)
  storage: Storage;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Inject(Cache.NAME)
  cache: Cache;

  static _beforeBuild(entityDef: IEntityRef, from: any, to: any) {
    _.keys(from).filter(k => k.startsWith('$')).map(k => {
      to[k] = from[k];
    });
  }

  static _afterEntity(entityDef: IEntityRef, entity: any[]): void {
    const props = entityDef.getPropertyRefs().filter(id => id.isIdentifier());
    entity.forEach(e => {
      const idStr = Expressions.buildLookupConditions(entityDef, e);
      const url = `api${API_STORAGE_PREFIX}${API_STORAGE_GET_ENTITY}`.replace(':name', entityDef.machineName).replace(':id', idStr);
      e[XS_P_URL] = url;
      e[XS_P_LABEL] = _.isFunction(e.label) ? e.label() : _.map(props, p => p.get(e)).join(' ');
    });

  }

  static checkOptions(opts: any, options: any) {
    if (!_.isEmpty(opts)) {
      const checked = {};
      _.keys(opts).filter(k => ['raw', 'timeout', 'validate', 'noTransaction', 'skipBuild'].indexOf(k) > -1 &&
        (_.isString(opts[k]) || _.isNumber(opts[k]) || _.isBoolean(opts[k])))
        .map(k => checked[k] = opts[k]);
      _.assign(options, opts);
    }
  }

  /**
   * Return list of schemas with their entities
   */
  // @Authorized('read metadata schema')
  // - Check if user has an explicit credential to access the method
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(API_STORAGE_METADATA_ALL_STORES)
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
  @Get(API_STORAGE_METADATA_GET_STORE)
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
  @Get(API_STORAGE_METADATA_ALL_ENTITIES)
  async getMetadataEntities(@CurrentUser() user: any) {
    const storageNames = this.storage.getNames();
    let data: IEntityRefMetadata[] = [];
    const arrs = await Promise.all(_.map(storageNames, storageName => {
      return this.getStorageSchema(storageName).then(e => e.entities);
    }));
    data = _.concat([], ...arrs);
    return data;
  }


  /**
   * Return list of defined entities
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Get(API_STORAGE_METADATA_GET_ENTITY)
  async getMetadataEntity(@Param('name') entityName: string, @CurrentUser() user: any) {
    const ref = this.getStorageRef(entityName);
    const entityRef = this.getEntityRef(ref, entityName);
    const entry = entityRef.toJson(true);
    (<any>entry).storage = ref.name;
    return entry;
  }


  /**
   * TODO
   */
  @Access(PERMISSION_ALLOW_ACCESS_STORAGE_METADATA)
  @Post(API_STORAGE_METADATA_CREATE_ENTITY)
  async entityCreate(@Body() data: any, @CurrentUser() user: any) {
    throw new NotYetImplementedError();
  }


  /**
   * Run a query for entity
   */
  @Access([PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY, PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN])
  @Get(API_STORAGE_FIND_ENTITY)
  async query(
    @Param('name') name: string,
    @QueryParam('query') query: string,
    @QueryParam('sort') sort: string = null,
    @QueryParam('limit') limit: number = 50,
    @QueryParam('offset') offset: number = 0,
    @QueryParam('opts') opts: any = {},
    @CurrentUser() user: any
  ) {

    const [entityRef, controller] = this.getControllerForEntityName(name);

    // try {
    //   this.invoker.use(StorageAPIControllerApi).prepareParams('query', entityRef, {
    //     name: name,
    //     query: query,
    //     sort: sort,
    //     limit: limit,
    //     opts: opts,
    //     user: user,
    //   });
    // } catch (e) {
    //   throw new HttpResponseError(['storage', 'query'], e.message);
    // }

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

    const options: IFindOptions = {
      limit: limit,
      offset: offset,
      sort: sortBy,
      // hooks: {afterEntity: StorageAPIController._afterEntity}
    };
    StorageAPIController.checkOptions(opts, options);

    const result = await controller.find(entityRef.getClassRef().getClass(), conditions, options);

    if (!_.isEmpty(result)) {
      StorageAPIController._afterEntity(entityRef, result);
    }

    const results = {
      entities: result,
      $count: result[XS_P_$COUNT],
      $limit: result[XS_P_$LIMIT],
      $offset: result[XS_P_$OFFSET]
    };

    try {
      this.invoker.use(StorageAPIControllerApi).postProcessResults('query', entityRef, results, {
        name: name,
        query: query,
        sort: sort,
        limit: limit,
        opts: opts,
        user: user,
      });
    } catch (e) {
      throw new HttpResponseError(['storage', 'query'], e.message);
    }

    return results;
  }


  /**
   * Return a single Entity
   */
  @Access([PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY, PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN])
  @Get(API_STORAGE_GET_ENTITY)
  async get(@Param('name') name: string, @Param('id') id: string, @QueryParam('opts') opts: any = {}, @CurrentUser() user: any) {
    if (_.isEmpty(name) || _.isEmpty(id)) {
      throw new HttpError(400, 'entity name or id not set');
    }

    const [entityRef, controller] = this.getControllerForEntityName(name);

    // try {
    //   this.invoker.use(StorageAPIControllerApi).prepareParams('get', entityRef, {
    //     name: name,
    //     id: id,
    //     opts: opts,
    //     user: user,
    //   });
    // } catch (e) {
    //   throw new HttpResponseError(['storage', 'get'], e.message);
    // }

    const options: IFindOptions = {
      limit: 0
    };

    StorageAPIController.checkOptions(opts, options);

    const conditions = Expressions.parseLookupConditions(entityRef, id);
    let result = null;
    if (_.isArray(conditions)) {
      result = await controller.find(entityRef.getClassRef().getClass(), conditions, options);
      StorageAPIController._afterEntity(entityRef, result);
      const results = {
        entities: result,
        $count: result[XS_P_$COUNT],
        $limit: result[XS_P_$LIMIT],
        $offset: result[XS_P_$OFFSET]
      };
      result = results;
    } else {
      options.limit = 1;
      result = await controller.find(entityRef.getClassRef().getClass(), conditions, options);
      StorageAPIController._afterEntity(entityRef, result);
      result = result.shift();
    }

    try {
      this.invoker.use(StorageAPIControllerApi).postProcessResults('get', entityRef, result, {
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
   * Return a new created Entity
   */
  @Access([PERMISSION_ALLOW_SAVE_STORAGE_ENTITY, PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN])
  @Post(API_STORAGE_SAVE_ENTITY)
  async save(@Param('name') name: string, @Body() data: any, @QueryParam('opts') opts: any = {}, @CurrentUser() user: any): Promise<any> {

    const [entityDef, controller] = this.getControllerForEntityName(name);
    // await this.invoker.use(EntityControllerApi).beforeEntityBuild(entityDef, data, user, controller);
    let entities;
    if (_.isArray(data)) {
      entities = _.map(data, d => entityDef.build(d, {beforeBuild: StorageAPIController._beforeBuild}));
    } else {
      entities = entityDef.build(data, {beforeBuild: StorageAPIController._beforeBuild});
    }
    const options: ISaveOptions = {validate: true};
    StorageAPIController.checkOptions(opts, options);
    try {
      const results = await controller.save(entities, options);
      this.invoker.use(StorageAPIControllerApi).postProcessResults('save', entityDef, results, {
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
  @Post(API_STORAGE_UPDATE_ENTITY)
  async update(@Param('name') name: string,
               @Param('id') id: string,
               @QueryParam('opts') opts: any = {},
               @Body() data: any,
               @CurrentUser() user: any) {

    const [entityDef, controller] = this.getControllerForEntityName(name);
    // await this.invoker.use(EntityControllerApi).beforeEntityBuild(entityDef, data, user, controller);
    let entities;
    if (_.isArray(data)) {
      entities = _.map(data, d => entityDef.build(d, {beforeBuild: StorageAPIController._beforeBuild}));
    } else {
      entities = entityDef.build(data, {beforeBuild: StorageAPIController._beforeBuild});
    }
    const options: ISaveOptions = {validate: true};

    StorageAPIController.checkOptions(opts, options);

    try {
      const results = await controller.save(entities, options);
      this.invoker.use(StorageAPIControllerApi).postProcessResults('update', entityDef, results, {
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
   * Return a deleted Entity
   */
  @Access([PERMISSION_ALLOW_DELETE_STORAGE_ENTITY, PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN])
  @Delete(API_STORAGE_DELETE_ENTITY)
  async delete(@Param('name') name: string,
               @Param('id') id: string,
               @QueryParam('opts') opts: any = {},
               @Body() data: any,
               @CurrentUser() user: any) {
    const [entityDef, controller] = this.getControllerForEntityName(name);
    const conditions = Expressions.parseLookupConditions(entityDef, id);
    const options: ISaveOptions = {};
    StorageAPIController.checkOptions(opts, options);
    const results = await controller.find(entityDef.getClassRef().getClass(), conditions, options);
    if (results.length > 0) {
      return controller.remove(results);
    }
    return null;
  }


  private getControllerForEntityName(name: string): [IEntityRef, StorageEntityController] {
    const storageRef = this.getStorageRef(name);
    const controller = storageRef.getController();
    const entityRef = this.getEntityRef(storageRef, name);
    return [entityRef, controller];
  }

  private getEntityRef(storageRef: StorageRef, entityName: string): IEntityRef {
    const entityRef = storageRef.getEntityRef(entityName);
    if (!entityRef) {
      throw new HttpResponseError(['storage', 'entity_ref_not_found'], 'Entity reference not found for ' + name);
    }
    return entityRef;
  }

  private getStorageRef(entityName: string): StorageRef {
    const storageRef = this.storage.forClass(entityName);
    if (!storageRef) {
      throw new HttpResponseError(['storage', 'reference_not_found'], 'Storage containing entity ' + name + ' not found');
    }
    return storageRef;
  }

  private async getFilterKeys(): Promise<string[]> {
    // TODO cache this!
    const cacheKey = 'storage_filter_keys';
    let filterKeys: string[] = await this.cache.get(cacheKey);
    if (filterKeys) {
      return filterKeys;
    }

    filterKeys = ['user', 'username', 'password'];
    const res: string[][] = <string[][]><any>this.invoker.use(ServerNodeInfoApi).filterConfigKeys();
    if (res && _.isArray(res)) {
      filterKeys = _.uniq(_.concat(filterKeys, ...res.filter(x => _.isArray(x))).filter(x => !_.isEmpty(x)));
    }
    await this.cache.set(cacheKey, filterKeys);
    return filterKeys;
  }

  private async getStorageSchema(storageName: string, withCollections: boolean = false, refresh: boolean = false) {
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
      type: storageRef.dbType,
      synchronize: options.synchronize,
      options: options,
      entities: []
    };
    storageRef.getOptions().entities.forEach(fn => {
      let ref: IEntityRef = null;
      if (_.isString(fn) || _.isFunction(fn)) {
        ref = storageRef.getEntityRef(fn);
      } else {
        ref = storageRef.getEntityRef((<EntitySchema<any>>fn).options.target);
      }
      ref.setOption('storage', storageName);
      const entityMetadata = ref.toJson(true);
      entry.entities.push(entityMetadata);
    });

    if (withCollections) {
      entry.collections = await this.getStorageRefCollections(storageRef);
    }

    await this.cache.set(cacheKey, entry, cacheBin, {ttl: 24 * 60 * 60 * 1000});
    return entry;
  }

  private async getStorageRefCollections(ref: StorageRef): Promise<ICollection[]> {

    try {
      const schemaHandler = ref.getSchemaHandler();
      const collectionNames = await schemaHandler.getCollectionNames();
      return await schemaHandler.getCollections(collectionNames);

    } catch (e) {
      Log.error(e);
    }
    return [];

  }

}
