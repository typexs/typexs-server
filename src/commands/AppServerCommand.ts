



import {Log, Storage, Inject, Container,Config} from "typexs-base";
import {AppServer, IExpressOptions, K_APPSERVER} from "../libs/AppServer";




export class AppServerCommand {

  @Inject()
  storage: Storage;

  command = "server <order>";
  aliases = "s";
  describe = "Commands to server";


  builder(yargs: any) {
    return yargs
  }

  async handler(argv: any) {

    if (argv.order == 'start') {


      let o_appserver: IExpressOptions = Config.get(K_APPSERVER, {});
      let server = new AppServer(o_appserver);
      await server.start();
      Log.info('start app server on ' + server.url());

    } else {
      console.log("No order")
    }

  }
}
