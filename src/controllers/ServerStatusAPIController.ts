import * as _ from 'lodash';
import {CurrentUser, Get, JsonController} from 'routing-controllers';
import {_API_CTRL_SERVER_PING, _API_CTRL_SERVER_STATUS, C_API} from '../libs/Constants';
import {ContextGroup} from '../decorators/ContextGroup';
import {Inject, Invoker, System} from '@typexs/base';
import {ServerNodeInfoApi} from '..';

@ContextGroup(C_API)
@JsonController()
export class ServerStatusAPIController {

  @Inject(System.NAME)
  system: System;

  // @Inject(RuntimeLoader.NAME)
  // loader: RuntimeLoader;
  //
  // @Inject(ServerRegistry.NAME)
  // serverRegistry: ServerRegistry;
  //
  // @Inject(Storage.NAME)
  // storage: Storage;
  //
  @Inject(Invoker.NAME)
  invoker: Invoker;

  /**
   * Ping for server time
   */
  @Get(_API_CTRL_SERVER_PING)
  ping(): any {
    return {time: new Date()};
  }


  @Get(_API_CTRL_SERVER_STATUS)
  async status(@CurrentUser() user: any) {
    // has auth, by auth modul
    // modules active?
    // enabled controller?
    // node name
    const nodeId = _.get(this.system, 'node.nodeId', null);
    const status: any = {
      time: new Date(),
      nodeId: nodeId,
    };
    await this.invoker.use(ServerNodeInfoApi).prepareServerStatus(status, user);
    return status;
  }


}
