import {Container} from "typedi";
import {EntitySchema} from "typeorm";
import {IActivator, IPermissions, Storage} from "@typexs/base";
import {ServerRegistry} from "./libs/server/ServerRegistry";
import {
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY,
  PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_ACCESS_STORAGE_METADATA,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,
  PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
  PERMISSION_ALLOW_MODULES_VIEW,
  PERMISSION_ALLOW_ROUTES_VIEW,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY,
  PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN,
  PERMISSION_ALLOW_STORAGE_ENTITY_VIEW,
  PERMISSION_ALLOW_STORAGES_VIEW, PERMISSION_ALLOW_TASK_EXEC,
  PERMISSION_ALLOW_TASK_GET_METADATA, PERMISSION_ALLOW_TASK_LOG, PERMISSION_ALLOW_TASK_STATUS,
  PERMISSION_ALLOW_TASKS_LIST,
  PERMISSION_ALLOW_TASKS_METADATA,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY,
  PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN
} from "./libs/Constants";


export class Activator implements IActivator, IPermissions {


  async startup() {
    let serverRegistry = new ServerRegistry();
    Container.set(ServerRegistry, serverRegistry);
    Container.set('ServerRegistry', serverRegistry);
  }

  permissions(): string[] {

    let permissions: string[] = [
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
      PERMISSION_ALLOW_DELETE_STORAGE_ENTITY,,
      // PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN

      PERMISSION_ALLOW_TASKS_LIST,
      PERMISSION_ALLOW_TASKS_METADATA,
      PERMISSION_ALLOW_TASK_GET_METADATA,
      PERMISSION_ALLOW_TASK_EXEC,
      PERMISSION_ALLOW_TASK_LOG,
      PERMISSION_ALLOW_TASK_STATUS
    ];

    let storage = Container.get(Storage);
    for (let name of storage.getNames()) {
      let ref = storage.get(name);
      let entities = ref.getOptions().entities;
      if (entities) {
        for (let entity of entities) {
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

    return permissions;
  }

}
