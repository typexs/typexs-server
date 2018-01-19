import {IServerInstanceOptions} from "./IServerInstanceOptions";

export interface IServer {

  name: string;

  initialize(options: IServerInstanceOptions): void;

  prepare(): void;

  start(): Promise<boolean>;

  stop(): Promise<boolean>;


}
