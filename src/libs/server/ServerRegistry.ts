import {StringOrFunction, Container, Inject} from "typexs-base";
import {ServerFactory} from "./ServerFactory";
import {IServer} from "./IServer";


export class ServerRegistry {

  factory: ServerFactory;

  registry: IServer[];


  constructor(){
    this.factory = new ServerFactory();
  }
}
