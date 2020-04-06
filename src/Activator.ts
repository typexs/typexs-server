// import {Container} from 'typedi';
import {EntitySchema} from 'typeorm';
import * as _ from 'lodash';
import {IActivator, Injector, Storage} from '@typexs/base';
import {ServerRegistry} from './libs/server/ServerRegistry';
import {
  PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY, PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_ACCESS_STORAGE_METADATA,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
  PERMISSION_ALLOW_MODULES_VIEW,
  PERMISSION_ALLOW_ROUTES_VIEW,
  PERMISSION_ALLOW_RUNTIME_INFO_VIEW,
  PERMISSION_ALLOW_RUNTIME_NODE_VIEW,
  PERMISSION_ALLOW_RUNTIME_NODES_VIEW,
  PERMISSION_ALLOW_RUNTIME_REMOTE_INFOS_VIEW,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_STORAGE_ENTITY_VIEW,
  PERMISSION_ALLOW_STORAGES_VIEW,
  PERMISSION_ALLOW_TASK_EXEC,
  PERMISSION_ALLOW_TASK_EXEC_PATTERN,
  PERMISSION_ALLOW_TASK_GET_METADATA,
  PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN,
  PERMISSION_ALLOW_TASK_LOG,
  PERMISSION_ALLOW_TASK_RUNNING,
  PERMISSION_ALLOW_TASK_STATUS,
  PERMISSION_ALLOW_TASKS_LIST,
  PERMISSION_ALLOW_TASKS_METADATA,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_WORKERS_INFO
} from './libs/Constants';
import {BasicPermission, IPermissionDef, IPermissions} from '@typexs/roles-api';


export class Activator implements IActivator, IPermissions {


  async startup() {
    const serverRegistry = new ServerRegistry();
    Injector.set(ServerRegistry, serverRegistry);
    Injector.set('ServerRegistry', serverRegistry);
  }

  permissions(): IPermissionDef[] {

    let permissions: string[] = [
      // runtime
      PERMISSION_ALLOW_RUNTIME_INFO_VIEW,
      PERMISSION_ALLOW_RUNTIME_NODE_VIEW,
      PERMISSION_ALLOW_RUNTIME_NODES_VIEW,
      PERMISSION_ALLOW_RUNTIME_REMOTE_INFOS_VIEW,
      PERMISSION_ALLOW_WORKERS_INFO,

      PERMISSION_ALLOW_ROUTES_VIEW,
      PERMISSION_ALLOW_MODULES_VIEW,
      PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
      PERMISSION_ALLOW_STORAGES_VIEW,
      PERMISSION_ALLOW_STORAGE_ENTITY_VIEW,

      PERMISSION_ALLOW_ACCESS_STORAGE_METADATA,
      PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
      // PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN,
      PERMISSION_ALLOW_SAVE_STORAGE_ENTITY,
      // PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN,
      PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY,
      // PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN,
      PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
      // PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN,

      PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY,
      // PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY_PATTERN,

      PERMISSION_ALLOW_TASKS_LIST,
      PERMISSION_ALLOW_TASKS_METADATA,

      PERMISSION_ALLOW_TASK_GET_METADATA,
      // PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN,

      PERMISSION_ALLOW_TASK_EXEC,
      PERMISSION_ALLOW_TASK_EXEC_PATTERN,

      PERMISSION_ALLOW_TASK_LOG,
      PERMISSION_ALLOW_TASK_STATUS,
      PERMISSION_ALLOW_TASK_RUNNING
    ];


    permissions = _.uniq(permissions.filter(x => !_.isEmpty(x)));

    const storage = Injector.get(Storage.NAME) as Storage;
    for (const name of storage.getNames()) {
      const ref = storage.get(name);
      const entities = ref.getOptions().entities;
      if (entities) {
        for (const entity of entities) {
          let eRef = null;
          if (entity instanceof EntitySchema) {
            eRef = ref.getEntityRef(entity.options.target);
          } else {
            eRef = ref.getEntityRef(entity);
          }

          if (eRef) {
            permissions.push(PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN.replace(':name', eRef.machineName));
            permissions.push(PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN.replace(':name', eRef.machineName));
            permissions.push(PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN.replace(':name', eRef.machineName));
            permissions.push(PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN.replace(':name', eRef.machineName));
          }
        }
      }
    }


    // TODO how to solve dynamic task injection and concret permissions?

    return permissions.map(x => new BasicPermission(x));
  }

}
