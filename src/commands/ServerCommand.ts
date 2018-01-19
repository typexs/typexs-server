



import {Log, Storage, Inject, Container,Config} from "typexs-base";





export class AppServerCommand {

  @Inject()
  storage: Storage;




  command = "server <op> [name]";
  aliases = "s";
  describe = "Commands to server";


  builder(yargs: any) {
    return yargs
  }

  async handler(argv: any) {

    if (argv.op == 'start') {

    } else {
      console.log("No order")
    }

  }
}
