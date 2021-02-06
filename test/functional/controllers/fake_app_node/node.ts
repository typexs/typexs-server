import {TEST_STORAGE_OPTIONS} from '../../config';
import {IEventBusConfiguration} from 'commons-eventbus';
import {Bootstrap, Config, ITypexsOptions} from '@typexs/base';

(async function () {
  const LOG_EVENT = true; //
  let bootstrap = Bootstrap
    .setConfigSources([{type: 'system'}])
    .configure(<ITypexsOptions & any>{
      app: {name: 'fake_app_node', nodeId: 'fake_app_node', path: __dirname},
      logging: {enable: LOG_EVENT, level: 'debug'},
      modules: {paths: [__dirname + '/../../../..']},
      storage: {default: TEST_STORAGE_OPTIONS},
      eventbus: {default: <IEventBusConfiguration>{adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}}},
    });
  bootstrap.activateLogger();
  bootstrap.activateErrorHandling();
  await bootstrap.prepareRuntime();
  bootstrap = await bootstrap.activateStorage();
  bootstrap = await bootstrap.startup();
  const timeout = parseInt(Config.get('argv.timeout', 20000), 10);

  const t = setTimeout(async () => {
    await bootstrap.shutdown();
  }, timeout);

  let running = true;
  process.on(<any>'message', async (m: string) => {

    if (m === 'shutdown') {
      running = false;
      clearTimeout(t);
      await bootstrap.shutdown();
      process.exit(0);
    }
  });
  process.on('exit', async () => {
    if (running) {
      running = false;
      clearTimeout(t);
      await bootstrap.shutdown();
    }
  });


})();

