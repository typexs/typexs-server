import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
// process.env.SQL_LOG = '1';
import {suite, test} from 'mocha-typescript';
import {Bootstrap, Config, Container} from '@typexs/base';
import {API_TASK_GET_METADATA_VALUE, K_ROUTE_CONTROLLER} from '../../../src/libs/Constants';
import {expect} from 'chai';
import {Helper, WebServer} from '../../../src';
import * as _ from 'lodash';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
import {IEventBusConfiguration} from 'commons-eventbus';
import {HttpFactory, IHttp} from 'commons-http';

const LOG_EVENT = TestHelper.logEnable(true);

const settingsTemplate: any = {
  storage: {
    default: TEST_STORAGE_OPTIONS
  },

  app: {name: 'demo', path: __dirname + '/fake_app_tasks', nodeId: 'server'},

  modules: {paths: [__dirname + '/../../..']},

  logging: {
    enable: LOG_EVENT,
    level: 'debug',
    transports: [{console: {}}],
  },

  server: {
    default: {
      type: 'web',
      framework: 'express',
      host: 'localhost',
      port: 4500,

      routes: [{
        type: K_ROUTE_CONTROLLER,
        context: 'api',
        routePrefix: 'api'
      }]
    }
  },
  workers: {access: [{name: 'TaskMonitorWorker', access: 'allow'}]},
  eventbus: {default: <IEventBusConfiguration>{adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}}},

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;
let request: IHttp = null;

@suite('functional/controllers/tasks_controller')
class TasksControllerSpec {


  static async before() {
    const settings = _.clone(settingsTemplate);
    request = HttpFactory.create();
    bootstrap = Bootstrap
      .setConfigSources([{type: 'system'}])
      .configure(settings)
      .activateErrorHandling()
      .activateLogger();

    await bootstrap.prepareRuntime();
    await bootstrap.activateStorage();
    await bootstrap.startup();

    server = Container.get('server.default');
    await server.start();
  }


  static async after() {
    if (server) {
      await server.stop();
    }
    await bootstrap.shutdown();
    Bootstrap.reset();
    Container.reset();
    Config.clear();
  }


  // @test
  // async 'get tasks list and metadata (local and remote)'() {
  //   const url = server.url();
  //
  //   const _url = (url + '/api' + API_TASKS_LIST);
  //   const _urlTaskLocal = (url + '/api' + API_TASK_GET_METADATA.replace(':taskName', 'local_simple_task'));
  //   const _urlTaskRemote = (url + '/api' + API_TASK_GET_METADATA.replace(':taskName', 'simple_task'));
  //   const _urlTasks = (url + '/api' + API_TASKS_METADATA);
  //   let rBefore: any = await request.get(_url, {json: true});
  //   expect(rBefore).to.not.be.null;
  //   rBefore = rBefore.body;
  //
  //   const p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
  //   await p.started;
  //   await TestHelper.wait(50);
  //
  //   let rAfter: any = await request.get(_url, {json: true});
  //   expect(rAfter).to.not.be.null;
  //   rAfter = rAfter.body;
  //   let rTasks: any = await request.get(_urlTasks, {json: true});
  //   expect(rTasks).to.not.be.null;
  //   rTasks = rTasks.body;
  //   let rTaskLocal: any = await request.get(_urlTaskLocal, {json: true});
  //   expect(rTaskLocal).to.not.be.null;
  //   rTaskLocal = rTaskLocal.body;
  //   let rTaskRemote: any = await request.get(_urlTaskRemote, {json: true});
  //   expect(rTaskRemote).to.not.be.null;
  //   rTaskRemote = rTaskRemote.body;
  //
  //   p.shutdown();
  //   await p.done;
  //   await TestHelper.wait(50);
  //
  //   let rFinished: any = await request.get(_url, {json: true});
  //   expect(rFinished).to.not.be.null;
  //   rFinished = rFinished.body;
  //   expect(rTasks).to.have.length(4);
  //   expect(rTaskLocal).to.deep.include({
  //       'id': 'local_simple_task',
  //       'name': 'local_simple_task',
  //       'type': 'entity',
  //       'machineName': 'local_simple_task',
  //       'options': {},
  //       'mode': '1',
  //       'hasWorker': false,
  //       'permissions': null,
  //       'description': null,
  //       'remote': null,
  //       'groups': [],
  //       'nodeIds': [
  //         'server'
  //       ],
  //       'target': {
  //         'schema': 'default',
  //         'className': 'LocalSimpleTask',
  //         'isEntity': false,
  //         'options': {}
  //       },
  //       'properties': [
  //         {
  //           'id': 'r',
  //           'name': 'r',
  //           'type': 'property',
  //           'machineName': 'r',
  //           'options': {},
  //           'descriptor': {
  //             'target': 'LocalSimpleTask',
  //             'propertyName': 'r',
  //             'type': 'runtime'
  //           }
  //         }
  //       ]
  //     }
  //   );
  //   expect(rTaskRemote).to.deep.include({
  //     'id': 'simple_task',
  //     'name': 'simple_task',
  //     'type': 'entity',
  //     'machineName': 'simple_task',
  //     'options': {
  //       'remote': true
  //     },
  //     'mode': '4',
  //     'hasWorker': false,
  //     'permissions': null,
  //     'description': null,
  //     'remote': true,
  //     'groups': [],
  //     'nodeIds': [
  //       'fake_app_node_tasks'
  //     ],
  //     'target': {
  //       'schema': 'default',
  //       'className': 'Object',
  //       'isEntity': false,
  //       'options': {}
  //     },
  //     'properties': []
  //   });
  //
  //
  //   expect(rBefore).to.have.length(2);
  //   expect(rAfter).to.have.length(4);
  //   expect(rAfter.find((x: any) => x.name === 'local_simple_task')).to.deep.include({
  //     name: 'local_simple_task',
  //     nodeIds: ['server']
  //   });
  //   expect(rAfter.find((x: any) => x.name === 'simple_task')).to.deep.include({
  //     name: 'simple_task',
  //     nodeIds: ['fake_app_node_tasks'],
  //     remote: true
  //   });
  //   expect(rFinished).to.have.length(2);
  //   expect(rBefore).to.be.deep.eq(rFinished);
  // }


  @test
  async 'tail file content'() {
    const tmpdir = os.tmpdir();
    let content = '';
    for (const x of _.range(1, 500)) {
      content += x + '\n';
    }
    const file = path.join(tmpdir, 'tail_test_file');
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    fs.writeFileSync(file, content);

    let _content: string = <string>await Helper.tail(file);
    expect(_content.split('\n').length).to.eq(500);
    _content = <string>await Helper.tail(file, 50);
    expect(_content.split('\n').length).to.eq(50);
  }


  // @test
  // async 'start remote task, monitor, log'() {
  //   const url = server.url();
  //   const events: TaskEvent[] = [];
  //
  //   class T02 {
  //     @subscribe(TaskEvent) on(e: TaskEvent) {
  //       const _e = _.cloneDeep(e);
  //       events.push(_e);
  //     }
  //   }
  //
  //   const z = new T02();
  //   await EventBus.register(z);
  //
  //
  //   const p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
  //   await p.started;
  //   await TestHelper.wait(50);
  //
  //
  //   const _url = url + '/api' + API_TASK_EXEC.replace(':taskName', 'simple_task');
  //   let taskEvent: any = await request.get(_url, {json: true});
  //   expect(taskEvent).to.not.be.null;
  //   taskEvent = taskEvent.body;
  //
  //   const _urlStatus = url + '/api' + API_TASK_STATUS.replace(':nodeId', taskEvent.respId).replace(':runnerId', taskEvent.id);
  //
  //   await TestHelper.waitFor(() => events.length >= 4, 10);
  //   const s = await (<StorageRef>Container.get(C_STORAGE_DEFAULT)).getController().find(TaskLog);
  //   let taskStatus1: any = await request.get(_urlStatus, {json: true});
  //   expect(taskStatus1).to.not.be.null;
  //   taskStatus1 = taskStatus1.body;
  //
  //   await TestHelper.waitFor(() => events.length >= 6);
  //
  //   // default tailed 50 lines log
  //   const _urlLog = url + '/api' + API_TASK_LOG
  //     .replace(':nodeId', taskEvent.respId)
  //     .replace(':runnerId', taskEvent.id);
  //   let taskLog: any = await request.get(_urlLog, {json: true});
  //   expect(taskLog).to.not.be.null;
  //   taskLog = taskLog.body;
  //
  //   // get first 20 lines
  //   const _urlLog2 = url + '/api' + API_TASK_LOG
  //     .replace(':nodeId', taskEvent.respId)
  //     .replace(':runnerId', taskEvent.id) + '?from=0&offset=20';
  //   let taskLog2: any = await request.get(_urlLog2, {json: true});
  //   expect(taskLog2).to.not.be.null;
  //   taskLog2 = taskLog2.body;
  //
  //   // get skip 20 lines
  //   const _urlLog3 = url + '/api' + API_TASK_LOG
  //     .replace(':nodeId', taskEvent.respId)
  //     .replace(':runnerId', taskEvent.id) + '?from=20&offset=20';
  //
  //   let taskLog3: IncomingMessage;
  //   try {
  //     taskLog3 = await request.get(_urlLog3, {json: true});
  //   } catch (e) {
  //
  //   }
  //
  //
  //   let taskStatus2 = await request.get(_urlStatus, {json: true});
  //   expect(taskStatus2).to.not.be.null;
  //   taskStatus2 = taskStatus2.body;
  //   p.shutdown();
  //
  //   await p.done;
  //   await EventBus.unregister(z);
  //
  //   expect(taskStatus1).to.be.deep.include({
  //     taskName: 'simple_task',
  //     taskNr: 0,
  //     nodeId: 'server',
  //     respId: 'fake_app_node_tasks',
  //   });
  //   expect(taskStatus2).to.be.deep.include({
  //     taskName: 'simple_task',
  //     taskNr: 0,
  //     state: 'stopped',
  //     nodeId: 'server',
  //     respId: 'fake_app_node_tasks',
  //     hasError: false,
  //     progress: 100,
  //     total: 100,
  //     done: true,
  //     running: false,
  //     data:
  //       {
  //         results: {task: 'great run'},
  //         incoming: {},
  //         outgoing: {},
  //         error: null
  //       }
  //   });
  //
  //   expect(taskLog.length).to.be.eq(1);
  //   expect(taskLog[0]).to.deep.include({
  //     level: 'info',
  //     message: 'task is running',
  //   });
  //   expect(taskLog2.length).to.be.eq(1);
  //   expect(taskLog2[0]).to.deep.include({
  //     level: 'info',
  //     message: 'task is running',
  //   });
  //   expect(taskLog3.statusCode).to.be.eq(204);
  //   expect(taskLog3.statusMessage).to.be.eq('No Content');
  //   expect(events.length).to.be.eq(6);
  //   expect(taskEvent).to.be.deep.include({
  //     'state': 'enqueue',
  //     'topic': 'data',
  //     'nodeId': 'server',
  //     'taskSpec': [
  //       'simple_task'
  //     ],
  //     'targetIds': [
  //       'fake_app_node_tasks'
  //     ],
  //     'respId': 'fake_app_node_tasks'
  //   });
  // }


  // @test
  // async 'start remote task with parameters'() {
  //   const url = server.url();
  //
  //   const events: TaskEvent[] = [];
  //
  //   class T02 {
  //     @subscribe(TaskEvent) on(e: TaskEvent) {
  //       const _e = _.cloneDeep(e);
  //       events.push(_e);
  //     }
  //   }
  //
  //   const z = new T02();
  //   await EventBus.register(z);
  //
  //   const p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
  //   await p.started;
  //   await TestHelper.wait(50);
  //
  //   const _url = url + '/api' + API_TASK_EXEC
  //       .replace(':taskName', 'simple_task_with_params') + '?parameters=' +
  //     JSON.stringify({need_this: {really: {important: 'data'}}}) + '&targetIds=' +
  //     JSON.stringify(['fake_app_node_tasks']);
  //   let taskEvent: any = await request.get(_url, {json: true});
  //   expect(taskEvent).to.not.be.null;
  //   taskEvent = taskEvent.body;
  //   await TestHelper.waitFor(() => events.length >= 6);
  //
  //   p.shutdown();
  //   await p.done;
  //   await EventBus.unregister(z);
  //
  //   const _urlStatus = url + '/api' + API_TASK_STATUS.replace(':nodeId', taskEvent.respId).replace(':runnerId', taskEvent.id);
  //   let taskStatus1: any = await request.get(_urlStatus, {json: true});
  //   expect(taskStatus1).to.not.be.null;
  //   taskStatus1 = taskStatus1.body;
  //   expect(taskEvent).to.be.deep.include({
  //     errors: [],
  //     state: 'enqueue',
  //     topic: 'data',
  //     nodeId: 'server',
  //     taskSpec: ['simple_task_with_params'],
  //     targetIds: ['fake_app_node_tasks'],
  //     parameters: {need_this: {really: {important: 'data'}}},
  //     respId: 'fake_app_node_tasks'
  //   });
  //
  //   expect(taskStatus1).to.be.deep.include({
  //     taskName: 'simple_task_with_params',
  //     taskNr: 0,
  //     state: 'stopped',
  //     nodeId: 'server',
  //     respId: 'fake_app_node_tasks',
  //     hasError: false,
  //     progress: 100,
  //     total: 100,
  //     done: true,
  //     running: false,
  //     weight: 0,
  //     data:
  //       {
  //         results: {task: 'great run with parameters'},
  //         incoming: {needThis: {really: {important: 'data'}}},
  //         outgoing: {for_others: 'best regards Robert'},
  //         error: null
  //       }
  //   });
  //
  //
  // }


  // @test
  // async 'start remote task without necessary parameters'() {
  //   const url = server.url();
  //
  //   const events: TaskEvent[] = [];
  //
  //   class T02 {
  //     @subscribe(TaskEvent) on(e: TaskEvent) {
  //       const _e = _.cloneDeep(e);
  //       events.push(_e);
  //     }
  //   }
  //
  //   const z = new T02();
  //   await EventBus.register(z);
  //
  //   const p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
  //   await p.started;
  //   await TestHelper.wait(50);
  //
  //   const _url = url + '/api' + API_TASK_EXEC
  //     .replace(':taskName', 'simple_task_with_params') + '?targetIds=' + JSON.stringify(['fake_app_node_tasks']);
  //   let taskEvent: any = await request.get(_url, {json: true});
  //   expect(taskEvent).to.not.be.null;
  //   taskEvent = taskEvent.body;
  //   p.shutdown();
  //   await p.done;
  //   await EventBus.unregister(z);
  //   expect(taskEvent).to.deep.include({
  //       errors:
  //         [{
  //           context: 'required_parameter',
  //           data: {required: 'needThis'},
  //           message: 'The required value is not passed.'
  //         }],
  //       state: 'request_error',
  //       topic: 'data',
  //       nodeId: 'server',
  //       taskSpec: ['simple_task_with_params'],
  //       targetIds: ['fake_app_node_tasks'],
  //       respId: 'fake_app_node_tasks'
  //     }
  //   );
  //
  // }


  @test
  async 'get content from value providers'() {
    const url = server.url();

    const _url = url + '/api' + API_TASK_GET_METADATA_VALUE
      .replace(':taskName', 'local_simple_task_with_params')
      .replace(':incomingName', 'valueStatic');

    let valueSuggestions1 = await request.get(_url, {json: true});
    expect(valueSuggestions1).to.not.be.null;
    valueSuggestions1 = valueSuggestions1.body;
    expect(valueSuggestions1).to.be.deep.eq(['One', 'Two', 'Tree']);

    const _url3 = url + '/api' + API_TASK_GET_METADATA_VALUE
      .replace(':taskName', 'local_simple_task_with_params')
      .replace(':incomingName', 'valueClass');

    let valueSuggestions3 = await request.get(_url3, {json: true});
    expect(valueSuggestions3).to.not.be.null;
    valueSuggestions3 = valueSuggestions3.body;
    expect(valueSuggestions3).to.be.deep.eq(['VP-One1', 'VP-Two2', 'VP-Tree3']);
    const _url2 = url + '/api' + API_TASK_GET_METADATA_VALUE
      .replace(':taskName', 'local_simple_task_with_params')
      .replace(':incomingName', 'valueFunction');

    let valueSuggestions2 = await request.get(_url2, {json: true});
    expect(valueSuggestions2).to.not.be.null;
    valueSuggestions2 = valueSuggestions2.body;
    expect(valueSuggestions2).to.be.deep.eq(['One1', 'Two2', 'Tree3']);


  }


  @test.skip
  async 'get current runners'() {
  }

  @test.skip
  async 'get local active current runners'() {
  }

  @test.skip
  async 'get all active current runners'() {
  }
}
