import {IServerInstanceOptions} from "./IServerInstanceOptions";

export interface IServer {

  name: string;

  initialize(options: IServerInstanceOptions): void;

  options(): IServerInstanceOptions;

  prepare(): void;

  start(): Promise<boolean>;

  stop(): Promise<boolean>;


}
