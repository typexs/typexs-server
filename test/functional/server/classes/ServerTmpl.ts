import {IServerInstanceOptions} from "../../../../src/libs/server/IServerInstanceOptions";
import {IServer} from "../../../../src/libs/server/IServer";
import {IRoute} from "../../../../src";

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

  getRoutes(): IRoute[] {
    return [];
  }

  getUri(): string {
    return "";
  }

  hasRoutes(): boolean {
    return false;
  }

}
