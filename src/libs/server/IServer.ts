import {IServerInstanceOptions} from './IServerInstanceOptions';
import {IRoute} from './IRoute';

export interface IServer {

  name: string;

  initialize(options: IServerInstanceOptions): void;

  options(): IServerInstanceOptions;

  prepare(): void;

  start(): Promise<boolean>;

  stop(): Promise<boolean>;

  hasRoutes(): boolean;

  getRoutes(): IRoute[];

  getUri(): string;
}


