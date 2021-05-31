import {Config, IBootstrap, Inject} from '@typexs/base';
import * as _ from 'lodash';
import {C_SERVER} from './libs/Constants';
import {ServerRegistry} from './libs/server/ServerRegistry';


export class Startup implements IBootstrap {

  @Inject('ServerRegistry')
  serverRegistry: ServerRegistry;


  async bootstrap(): Promise<void> {
    const data = Config.get(C_SERVER, {});

    if (!_.isEmpty(data)) {
      await this.serverRegistry.load(data);
    }
  }



}
