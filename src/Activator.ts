import {RuntimeLoader, Inject, Config, TYPEXS_NAME, Container} from "typexs-base";
import {ServerRegistry} from "./libs/server/ServerRegistry";
import {C_SERVER} from "./types";


export class Activator {

  /*
  @Inject('RuntimeLoader')
  loader: RuntimeLoader;
*/

  async startup() {

    let data = Config.get(C_SERVER, {});
    let serverRegistry = new ServerRegistry();
    Container.set(ServerRegistry, serverRegistry);
    Container.set(ServerRegistry.name, serverRegistry);

    if (data) {
      await serverRegistry.load(data);
    }

  }

}
