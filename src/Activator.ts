import {Config, Container, IActivator, Inject, RuntimeLoader, TYPEXS_NAME} from "@typexs/base";
import {ServerRegistry} from "./libs/server/ServerRegistry";


export class Activator implements IActivator{


  async startup() {
    let serverRegistry = new ServerRegistry();
    Container.set(ServerRegistry, serverRegistry);
    Container.set('ServerRegistry', serverRegistry);
  }

}
