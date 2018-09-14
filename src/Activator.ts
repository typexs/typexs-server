import {RuntimeLoader, Inject, Config, TYPEXS_NAME, Container, IActivator} from "typexs-base";
import {ServerRegistry} from "./libs/server/ServerRegistry";
import {C_SERVER} from "./types";
import * as _ from 'lodash';


export class Activator implements IActivator{


  async startup() {
    let serverRegistry = new ServerRegistry();
    Container.set(ServerRegistry, serverRegistry);
    Container.set('ServerRegistry', serverRegistry);
  }

}
