import {Config, IBootstrap, Inject} from '@typexs/base';
import * as _ from "lodash";
import {C_SERVER} from "./types";
import {ServerRegistry} from "./libs/server/ServerRegistry";


export class Bootstrap implements IBootstrap {

  @Inject('ServerRegistry')
  serverRegistry: ServerRegistry;


  async bootstrap(): Promise<void> {
    let data = Config.get(C_SERVER, {});

    if (!_.isEmpty(data)) {
      await this.serverRegistry.load(data);
    }
  }

}