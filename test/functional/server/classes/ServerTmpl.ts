import {IServerInstanceOptions} from "../../../../src/libs/server/IServerInstanceOptions";
import {IServer} from "../../../../src/libs/server/IServer";

export class ServerTmpl implements IServer {
  name: string = 'x';

  initialize(options: IServerInstanceOptions) {
  };

  options(): IServerInstanceOptions{return <IServerInstanceOptions>{};}

  prepare() {
  };


  async start() {
    return true;
  };

  async stop() {
    return true;
  };

}
