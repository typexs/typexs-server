import {Inject, Log, Storage} from "typexs-base";
import {ServerRegistry} from "../";


export class ServerCommand {

  @Inject('Storage')
  storage: Storage;

  @Inject()
  registry: ServerRegistry;


  command = "server [name] [op]";
  aliases = "s";
  describe = "Commands to server";


  builder(yargs: any) {
    return yargs
  }

  async start(name:string){
    let service = this.registry.get(name);
    let status = await service.start();
    if(status) {
      Log.info('Server ' + name + ' started.');
    }else{
      Log.error('Failed to start server ' + name+'.');
    }

  }

  async handler(argv: any) {
    if (argv.name) {
      await this.start(argv.name);
    }else{
      let instanceNames = this.registry.getInstanceNames();
      let p = []
      for(let name of instanceNames){
        await this.start(name);
      }
    }
  }
}
