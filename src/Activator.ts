import {RuntimeLoader,Inject,Config,TYPEXS_NAME,Container} from "typexs-base";
import {ServerRegistry} from "./libs/server/ServerRegistry";
import {C_SERVER} from "./types";


export class Activator {

  @Inject()
  loader: RuntimeLoader;

  async startup(){

    let data = Config.get(C_SERVER, TYPEXS_NAME);
    let serverRegistry = new ServerRegistry();
    if(data){
      await serverRegistry.load(data);
      Container.set(ServerRegistry,serverRegistry);
    }

  }

}
