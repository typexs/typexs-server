import * as _ from "lodash";
import {StringOrFunction, Container, Inject} from "typexs-base";
import {ServerFactory} from "./ServerFactory";
import {IServer} from "./IServer";
import {IServerInstanceOptions} from "./IServerInstanceOptions";
import {ServerTypeIsNotSetError} from "../exceptions/ServerTypeIsNotSetError";
import {ServerUtils} from "./ServerUtils";


export class ServerRegistry {

  factory: ServerFactory;

  registry: IServer[] = [];


  constructor() {
    this.factory = new ServerFactory();
  }


  async load(options: any) {
    let servers = {};
    for (let name in options) {
      let opts = options[name];
      servers[name] = await this.create(name, opts);
    }
    return servers;
  }


  async create(name: string, options: IServerInstanceOptions): Promise<IServer> {
    if (!ServerUtils.checkIfTypeIsSet(options)) {
      throw new ServerTypeIsNotSetError();
    }
    let server: IServer = this.factory.get(options.type);
    server.name = name;
    Container.set('server.' + name, server);
    server.initialize(options);
    await server.prepare();
    this.registry.push(server);
    return server;
  }


  getInstanceNames():string[]{
    return _.map(this.registry,(x) => {return x.name;})
  }

  get(name: string) {
    return _.find(this.registry, {name: name});
  }
}
