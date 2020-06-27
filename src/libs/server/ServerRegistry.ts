import * as _ from 'lodash';
import {StringOrFunction, Injector, Inject} from '@typexs/base';
import {ServerFactory} from './ServerFactory';
import {IServer} from './IServer';
import {IServerInstanceOptions} from './IServerInstanceOptions';
import {ServerTypeIsNotSetError} from '../exceptions/ServerTypeIsNotSetError';
import {ServerUtils} from './ServerUtils';


export class ServerRegistry {
  static NAME = 'ServerRegistry';

  factory: ServerFactory;

  registry: IServer[] = [];


  constructor() {
    this.factory = new ServerFactory();
  }


  async load(options: any) {
    const servers = {};
    for (const name in options) {
      if (options.hasOwnProperty(name)) {
        const opts = options[name];
        servers[name] = await this.create(name, opts);
      }
    }
    return servers;
  }


  async create(name: string, options: IServerInstanceOptions): Promise<IServer> {
    if (!ServerUtils.checkIfTypeIsSet(options)) {
      throw new ServerTypeIsNotSetError();
    }
    const server: IServer = this.factory.get(options.type);
    server.name = name;
    Injector.set('server.' + name, server);
    server.initialize(options);
    await server.prepare();
    this.registry.push(server);
    return server;
  }


  getInstanceNames(): string[] {
    return _.map(this.registry, (x) => {
      return x.name;
    });
  }


  get(name: string): IServer {
    return _.find(this.registry, {name: name});
  }

}
