import {TEST_STORAGE_OPTIONS} from '../../config';
import {IEventBusConfiguration} from 'commons-eventbus';
import {Bootstrap, Config, ITypexsOptions} from '@typexs/base';

(async function () {
  const LOG_EVENT = !!process.argv.find(x => x === '--enable_log');
  let NODEID = process.argv.find(x => x.startsWith('--nodeId='));
  if (NODEID) {
    NODEID = NODEID.split('=').pop();
  } else {
    NODEID = 'fake_app_node_tasks';
  }

  let bootstrap = Bootstrap
    .setConfigSources([{type: 'system'}])
    .configure(<ITypexsOptions & any>{
      app: {name: NODEID, nodeId: NODEID, path: __dirname},
      logging: {enable: LOG_EVENT, level: 'debug', loggers: [{name: '*', level: 'debug'}]},
      modules: {paths: [__dirname + '/../../../..']},
      storage: {default: TEST_STORAGE_OPTIONS},
      eventbus: {default: <IEventBusConfiguration>{adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}}},
      workers: {
        access: [
          {name: 'TaskQueueWorker', access: 'allow'},
          {name: 'ExchangeMessageWorker', access: 'allow'}
        ]
      },
      tasks: {logdir: '/tmp/taskmonitor/fake_app_node_tasks'},
      filesystem: {paths: ['/tmp/taskmonitor']}
    });

  // create manuell
  // PlatformUtils.mkdir('/tmp/taskmonitor/fake_app_node_tasks');

  bootstrap.activateLogger();
  bootstrap.activateErrorHandling();
  await bootstrap.prepareRuntime();
  bootstrap = await bootstrap.activateStorage();
  bootstrap = await bootstrap.startup();


  process.send('startup');

  const timeout = parseInt(Config.get('argv.timeout', 240000), 0);
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

