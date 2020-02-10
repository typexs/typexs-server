import * as _ from 'lodash';
import {CurrentUser, Get, JsonController, Param, QueryParam} from 'routing-controllers';
import {
  Cache,
  DistributedStorageEntityController,
  Inject,
  Invoker,
  Log,
  Storage,
  StorageRef,
  XS_P_$COUNT,
  XS_P_$LIMIT,
  XS_P_$OFFSET
} from '@typexs/base';
import {
  _API_DISTRIBUTED_STORAGE,
  _API_DISTRIBUTED_STORAGE_FIND_ENTITY,
  Access,
  API_DISTRIBUTED_STORAGE_GET_ENTITY,
  ContextGroup,
  PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY,
  PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY_PATTERN,
  XS_P_LABEL,
  XS_P_URL
} from '..';
import {HttpResponseError} from '../libs/exceptions/HttpResponseError';
import {IEntityRef} from 'commons-schema-api';
import {Expressions} from 'commons-expressions';
import {JsonUtils} from 'commons-base';


@ContextGroup('api')
@JsonController(_API_DISTRIBUTED_STORAGE)
export class DistributedStorageAPIController {

  @Inject(Storage.NAME)
  storage: Storage;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Inject(Cache.NAME)
  cache: Cache;


  @Inject()
  controller: DistributedStorageEntityController;

  static _afterEntity(entityDef: IEntityRef, entity: any[]): void {
    const props = entityDef.getPropertyRefs().filter(id => id.isIdentifier());
    entity.forEach(e => {
      const idStr = Expressions.buildLookupConditions(entityDef, e);
      const nodeId = e.__nodeId__;
      const url = `${API_DISTRIBUTED_STORAGE_GET_ENTITY}`
        .replace(':name', entityDef.machineName)
        .replace(':id', idStr)
        .replace(':nodeId', nodeId);
      e[XS_P_URL] = url;
      e[XS_P_LABEL] = _.isFunction(e.label) ? e.label() : _.map(props, p => p.get(e)).join(' ');
    });

  }
  /**
   * Run a query for entity
   */
  @Access([
    PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY,
    PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY_PATTERN
  ])
  @Get(_API_DISTRIBUTED_STORAGE_FIND_ENTITY)
  async query(
    @Param('name') name: string,
    @QueryParam('query') query: string,
    @QueryParam('sort') sort: string,
    @QueryParam('limit') limit: number = 50,
    @QueryParam('offset') offset: number = 0,
    @QueryParam('nodeId') nodeId: string = null,
    @CurrentUser() user: any
  ) {

    const [entityRef, controller] = this.getControllerForEntityName(name);

    let conditions = null;
    if (query) {
      conditions = JsonUtils.parse(query);
      if (!_.isPlainObject(conditions)) {
        throw new Error('conditions are wrong ' + query);
      }
    }
    let sortBy = null;
    if (sort) {
      sortBy = JsonUtils.parse(sort);
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

    let result: any[] = [];

    try {
      result = await controller.find(entityRef.getClassRef().getClass(), conditions, {
        limit: limit,
        offset: offset,
        sort: sortBy,
      });
    } catch (err) {
      Log.error(err);
    }

    if (!_.isEmpty(result)) {
      DistributedStorageAPIController._afterEntity(entityRef, result);
    }

    return {
      entities: result,
      $count: result[XS_P_$COUNT],
      $limit: result[XS_P_$LIMIT],
      $offset: result[XS_P_$OFFSET]
    };
  }

  private getControllerForEntityName(name: string): [IEntityRef, DistributedStorageEntityController] {
    const storageRef = this.getStorageRef(name);
    // let controller = Container.get(DistributedStorageEntityController);
    const entityRef = this.getEntityRef(storageRef, name);
    return [entityRef, this.controller];
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
}
