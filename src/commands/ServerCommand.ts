import {Inject, Log} from '@typexs/base';
import {ServerRegistry} from '../libs/server/ServerRegistry';


export class ServerCommand {


  @Inject('ServerRegistry')
  registry: ServerRegistry;

  command = 'server [name] [op]';

  aliases = 's';

  describe = 'Commands to server';


  builder(yargs: any) {
    return yargs;
  }

  async start(name: string) {
    const service = this.registry.get(name);
    const status = await service.start();
    if (status) {
      Log.info('Server ' + name + ' started.');
      await new Promise(resolve => {
        process.on('exit', resolve);
      });
    } else {
      Log.error('Failed to start server ' + name + '.');
    }

  }

  async handler(argv: any) {
    if (argv.name) {
      await this.start(argv.name);
    } else {
      const instanceNames = this.registry.getInstanceNames();
      const p = [];
      for (const name of instanceNames) {
        await this.start(name);
      }
    }
  }
}
