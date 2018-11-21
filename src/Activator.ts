import {Container, IActivator, IPermissions} from "@typexs/base";
import {ServerRegistry} from "./libs/server/ServerRegistry";
import {
  PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
  PERMISSION_ALLOW_MODULES_VIEW,
  PERMISSION_ALLOW_ROUTES_VIEW, PERMISSION_ALLOW_STORAGE_ENTITY_VIEW, PERMISSION_ALLOW_STORAGES_VIEW
} from "./libs/Constants";


export class Activator implements IActivator, IPermissions {


  async startup() {
    let serverRegistry = new ServerRegistry();
    Container.set(ServerRegistry, serverRegistry);
    Container.set('ServerRegistry', serverRegistry);
  }

  permissions(): string[] {
    return [
      PERMISSION_ALLOW_ROUTES_VIEW,
      PERMISSION_ALLOW_MODULES_VIEW,
      PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW,
      PERMISSION_ALLOW_STORAGES_VIEW,
      PERMISSION_ALLOW_STORAGE_ENTITY_VIEW
    ]
  }

}
