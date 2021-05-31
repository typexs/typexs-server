import {EntitySchema} from 'typeorm';
import {isEmpty, uniq} from 'lodash';
import {IActivator, Injector, Storage} from '@typexs/base';
import {ServerRegistry} from './libs/server/ServerRegistry';
import {
  PERMISSION_ACCESS_FILES,
  PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS,
  PERMISSION_ALLOW_ACCESS_REGISTRY_NAMESPACES,
  PERMISSION_ALLOW_ACCESS_REGISTRY_SCHEMAS,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_ACCESS_STORAGE_METADATA,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY,
  PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY,
  PERMISSION_ALLOW_MODULES_VIEW,
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
import {IEntityRef} from '@allgemein/schema-api';
import {CONFIG_SCHEMA} from './config.schema';


export class Activator implements IActivator, IPermissions {

  configSchema(): any {
    return CONFIG_SCHEMA;
  }

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

      PERMISSION_ALLOW_MODULES_VIEW,
      PERMISSION_ALLOW_STORAGES_VIEW,
      PERMISSION_ALLOW_STORAGE_ENTITY_VIEW,

      /**
       * Storage Permissions
       */
      PERMISSION_ALLOW_ACCESS_STORAGE_METADATA,
      PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
      // PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN,
      PERMISSION_ALLOW_SAVE_STORAGE_ENTITY,
      // PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN,
      PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY,
      // PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN,
      PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
      // PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN,

      /**
       * Distributed Storage Permissions
       */
      PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY,
      PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY,
      PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY,
      PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY,

      /**
       * Tasks Permissions
       */
      PERMISSION_ALLOW_TASKS_LIST,
      PERMISSION_ALLOW_TASKS_METADATA,

      PERMISSION_ALLOW_TASK_GET_METADATA,
      PERMISSION_ALLOW_TASK_EXEC,
      PERMISSION_ALLOW_TASK_EXEC_PATTERN,

      PERMISSION_ALLOW_TASK_LOG,
      PERMISSION_ALLOW_TASK_STATUS,
      PERMISSION_ALLOW_TASK_RUNNING,

      /**
       * File Permissions
       */
      PERMISSION_ACCESS_FILES,

      /**
       * Registry Permissions
       */
      PERMISSION_ALLOW_ACCESS_REGISTRY_NAMESPACES,
      PERMISSION_ALLOW_ACCESS_REGISTRY_SCHEMAS,
      PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS
      // PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE
    ];


    permissions = uniq(permissions.filter(x => !isEmpty(x)));

    const storage = Injector.get(Storage.NAME) as Storage;
    for (const name of storage.getNames()) {
      const ref = storage.get(name);
      const entities = ref.getOptions().entities;
      if (entities) {
        for (const entity of entities) {
          let eRef = null;
          if (entity instanceof EntitySchema) {
            eRef = ref.getEntityRef(entity.options.target) as IEntityRef;
          } else {
            eRef = ref.getEntityRef(entity) as IEntityRef;
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

    permissions = uniq(permissions);


    // TODO how to solve dynamic task injection and concret permissions?

    return permissions.map(x => new BasicPermission(x));
  }



}
