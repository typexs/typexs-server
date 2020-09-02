// process.env.SQL_LOG = '1';
import {suite, test, timeout} from '@testdeck/mocha';
import {Bootstrap, Config, Injector} from '@typexs/base';
import {
  API_CTRL_TASK_EXEC,
  API_CTRL_TASK_GET_METADATA,
  API_CTRL_TASK_LOG,
  API_CTRL_TASK_STATUS,
  API_CTRL_TASKS_LIST,
  API_CTRL_TASKS_METADATA,
  API_CTRL_TASKS_RUNNERS_INFO,
  API_CTRL_TASKS_RUNNING,
  API_CTRL_TASKS_RUNNING_ON_NODE,
  K_ROUTE_CONTROLLER
} from '../../../src/libs/Constants';
import {expect} from 'chai';
import * as _ from 'lodash';
import {SpawnHandle} from '../SpawnHandle';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
import {EventBus, IEventBusConfiguration, subscribe} from 'commons-eventbus';
import {TaskEvent} from '@typexs/base/libs/tasks/worker/TaskEvent';
import {HttpFactory, IHttp} from 'commons-http';
import {TaskExecutor} from '@typexs/base/libs/tasks/TaskExecutor';
import {ITaskRunnerResult} from '@typexs/base/libs/tasks/ITaskRunnerResult';
import {ITaskExectorOptions} from '@typexs/base/libs/tasks/ITaskExectorOptions';
import {WebServer} from '../../../src/libs/web/WebServer';

const LOG_EVENT = TestHelper.logEnable(false);


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
    loggers: [{name: '*', level: 'debug'}]
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
  // workers: {access: [{name: 'TaskMonitorWorker', access: 'allow'}]},
  eventbus: {default: <IEventBusConfiguration>{adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}}},

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;
let request: IHttp = null;
let p: SpawnHandle = null;
let URL: string = null;


/**
 * Task tests on nodes with differnet tasks
 *
 * - fake_app_tasks
 * - fake_app_node_tasks
 *
 */
@suite('functional/controllers/tasks_controller (on remote node)') @timeout(60000)
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

    server = Injector.get('server.default');
    await server.start();

    URL = server.url();

    p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts')
      .start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);
  }


  static async after() {
    if (p) {
      p.shutdown();
      await p.done;
    }
    if (server) {
      await server.stop();
    }
    if (bootstrap) {
      await bootstrap.shutdown();
    }
    Bootstrap.reset();
    Injector.reset();
    Config.clear();
  }


  @test
  async 'get tasks list and metadata'() {
    const _url = (URL + '/api' + API_CTRL_TASKS_LIST);
    const _urlTaskLocal = (URL + '/api' + API_CTRL_TASK_GET_METADATA.replace(':taskName', 'local_simple_task'));
    const _urlTaskRemote = (URL + '/api' + API_CTRL_TASK_GET_METADATA.replace(':taskName', 'simple_task'));
    const _urlTasks = (URL + '/api' + API_CTRL_TASKS_METADATA);

    let rAfter: any = await request.get(_url, {json: true});
    expect(rAfter).to.not.be.null;
    rAfter = rAfter.body;
    let rTasks: any = await request.get(_urlTasks, {json: true});
    expect(rTasks).to.not.be.null;
    rTasks = rTasks.body;
    let rTaskLocal: any = await request.get(_urlTaskLocal, {json: true});
    expect(rTaskLocal).to.not.be.null;
    rTaskLocal = rTaskLocal.body;
    let rTaskRemote: any = await request.get(_urlTaskRemote, {json: true});
    expect(rTaskRemote).to.not.be.null;
    rTaskRemote = rTaskRemote.body;

    expect(rTasks).to.have.length(6);
    expect(rTaskLocal).to.deep.include({
        'id': 'local_simple_task',
        'name': 'local_simple_task',
        'type': 'entity',
        'machineName': 'local_simple_task',
        'options': {worker: false},
        'mode': '1',
        'permissions': null,
        'description': null,
        'remote': null,
        'groups': [],
        nodeInfos: [
          {
            'nodeId': 'server',
            'hasWorker': false
          }
        ],
        'target': {
          'schema': 'default',
          'className': 'LocalSimpleTask',
          'isEntity': false,
          'options': {}
        },
        'properties': [
          {
            'id': 'r',
            'name': 'r',
            'type': 'property',
            'machineName': 'r',
            'options': {},
            'descriptor': {
              'target': 'LocalSimpleTask',
              'propertyName': 'r',
              'type': 'runtime'
            }
          }
        ]
      }
    );
    expect(rTaskRemote).to.deep.include({
      'id': 'simple_task',
      'name': 'simple_task',
      'type': 'entity',
      'machineName': 'simple_task',
      'options': {
        'remote': true
      },
      'mode': '4',
      'permissions': null,
      'description': null,
      'remote': true,
      'groups': [],
      nodeInfos: [
        {
          'hasWorker': true,
          'nodeId': 'fake_app_node_tasks'
        }
      ],
      'target': {
        'schema': 'default',
        'className': 'Object',
        'isEntity': false,
        'options': {}
      },
      'properties': []
    });


    // expect(rBefore).to.have.length(2);
    expect(rAfter).to.have.length(6);
    expect(rAfter.find((x: any) => x.name === 'local_simple_task')).to.deep.include({
      name: 'local_simple_task',
      nodeInfos: [
        {
          'nodeId': 'server',
          'hasWorker': false
        }
      ],
    });
    expect(rAfter.find((x: any) => x.name === 'simple_task')).to.deep.include({
      name: 'simple_task',
      nodeInfos: [
        {
          'hasWorker': true,
          'nodeId': 'fake_app_node_tasks'
        }
      ],
      remote: true
    });
  }


  @test
  async 'execute remote task (without waiting for results)'() {
    const _url = URL + '/api' + API_CTRL_TASK_EXEC.replace(':taskName', 'simple_task');
    const taskEvent: any = await request.get(_url, {json: true, passBody: true});
    expect(taskEvent).to.not.be.null;
    expect(taskEvent).to.be.length(1);
    expect(taskEvent[0]).to.be.deep.include({
      errors: [],
      state: 'enqueue',
      topic: 'data',
      taskSpec: ['simple_task'],
      nodeId: 'fake_app_node_tasks',
      targetIds: ['server'],
      respId: 'fake_app_node_tasks'
    });

  }

  @test
  async 'execute remote task (waiting for results)'() {

    const options: ITaskExectorOptions = {waitForRemoteResults: true};
    let _url = URL + '/api' + API_CTRL_TASK_EXEC.replace(':taskName', 'simple_task');
    _url = _url + '?options=' + JSON.stringify(options);
    const taskEvent: any = await request.get(_url, {json: true, passBody: true});
    expect(taskEvent).to.not.be.null;
    expect(taskEvent).to.be.length(1);
    // console.log(inspect(taskEvent, false, 10));
    expect(taskEvent[0]).to.be.deep.include({
      state: 'stopped',
      callerId: 'server',
      nodeId: 'fake_app_node_tasks',
      targetIds: ['fake_app_node_tasks'],
      tasks: ['simple_task'],
    });
    expect(taskEvent[0].results[0]).to.be.deep.include({
      weight: 0,
      progress: 100,
      total: 100,
      done: true,
      running: false,
      incoming: {},
      outgoing: {},
      result: {task: 'great run'},
      error: null,
      has_error: false,
      counters: {counter: []},
      name: 'simple_task',
    });
  }


  @test
  async 'execute remote task and get status'() {
    const _url = URL + '/api' + API_CTRL_TASK_EXEC.replace(':taskName', 'simple_task');
    // _url = _url + '?options=' + JSON.stringify(options);
    const taskEvents: any = await request.get(_url, {json: true, passBody: true});
    expect(taskEvents).to.not.be.null;
    expect(taskEvents).to.be.length(1);
    await TestHelper.wait(100);
    const taskEvent = taskEvents.shift();
    const _urlStatus = URL + '/api' + API_CTRL_TASK_STATUS
      .replace(':runnerId', taskEvent.id);


    const taskStatuses: any = await request.get(_urlStatus, {json: true, passBody: true});
    // console.log(inspect(taskEvent, false, 10));
    // console.log(inspect(taskStatuses, false, 10));
    expect(taskStatuses).to.not.be.null;
    expect(taskStatuses).to.be.have.length(1);
    const taskStatus = taskStatuses.shift();
    expect(taskStatus).to.be.deep.include({
      tasksId: taskEvent.id,
      taskName: 'simple_task',
      callerId: 'server',
      nodeId: 'fake_app_node_tasks',
      respId: 'fake_app_node_tasks',
      hasError: false,
      total: 100,
    });
  }

  @test
  async 'execute remote task with parameters'() {
    const events: TaskEvent[] = [];

    class T02 {
      @subscribe(TaskEvent) on(e: TaskEvent) {
        const _e = _.cloneDeep(e);
        events.push(_e);
      }
    }

    const z = new T02();
    await EventBus.register(z);

    const _url = URL + '/api' + API_CTRL_TASK_EXEC
        .replace(':taskName', 'simple_task_with_params') + '?params=' +
      JSON.stringify({need_this: {really: {important: 'data'}}}) + '&targetIds=' +
      JSON.stringify(['fake_app_node_tasks']);
    const taskEvents: TaskEvent[] = await request.get(_url, {passBody: true, json: true}) as any;
    expect(taskEvents).to.not.be.null;
    expect(taskEvents.length).to.be.gt(0);
    const taskEvent = taskEvents.shift();
    await TestHelper.waitFor(() => !!events.find(x => x.id === taskEvent.id && x.state === 'stopped'));

    await EventBus.unregister(z);

    await TestHelper.wait(100);
    // wait till task is finished
    // TODO check status with targetId as options
    const _urlStatus = URL + '/api' + API_CTRL_TASK_STATUS
      .replace(':runnerId', taskEvent.id);


    const taskStatuses: any = await request.get(_urlStatus, {passBody: true, json: true});
    expect(taskStatuses).to.not.be.null;
    expect(taskStatuses.length).to.be.gt(0);
    const taskStatus1 = taskStatuses.shift();

    expect(taskEvent).to.be.deep.include({
      errors: [],
      state: 'enqueue',
      topic: 'data',
      nodeId: 'fake_app_node_tasks',
      taskSpec: ['simple_task_with_params'],
      targetIds: ['server'],
      parameters: {need_this: {really: {important: 'data'}}},
      respId: 'fake_app_node_tasks'
    });
    expect(taskStatus1).to.be.deep.include({
      taskName: 'simple_task_with_params',
      taskNr: 0,
      state: 'stopped',
      callerId: 'server',
      nodeId: 'fake_app_node_tasks',
      respId: 'fake_app_node_tasks',
      hasError: false,
      progress: 100,
      total: 100,
      done: true,
      running: false,
      weight: 0,
      data:
        {
          results: {task: 'great run with parameters'},
          incoming: {needThis: {really: {important: 'data'}}},
          outgoing: {for_others: 'best regards Robert'},
          error: null
        }
    });
  }


  @test
  async 'execute remote task without necessary parameters'() {
    const _url = URL + '/api' + API_CTRL_TASK_EXEC
        .replace(':taskName', 'simple_task_with_params') + '?targetIds=' +
      JSON.stringify(['fake_app_node_tasks']);
    try {
      const taskEvents: TaskEvent[] = await request.get(_url, {passBody: true, json: true}) as any;
      expect(true).to.be.eq(false);
    } catch (err) {
      const body = err.body;
      expect(body.message).to.be.eq('The required value is not passed. data: {"required":"needThis"}');
    }
  }


  @test
  async 'execute remote task without necessary parameters (skip throwing)'() {
    const _url = URL + '/api' + API_CTRL_TASK_EXEC
        .replace(':taskName', 'simple_task_with_params') + '?targetIds=' +
      JSON.stringify(['fake_app_node_tasks']) +
      '&options=' + JSON.stringify(<ITaskExectorOptions>{skipThrow: true});
    const taskEvents: TaskEvent[] = await request.get(_url, {passBody: true, json: true}) as any;
    expect(taskEvents).to.have.length(1);
    expect(taskEvents[0].errors).to.have.length(1);
    expect(taskEvents[0].errors[0].message).to.be.eq('The required value is not passed.');
    expect(taskEvents[0].errors[0].data).to.be.deep.eq({'required': 'needThis'});
  }

  @test.skip
  async 'execute remote task (request error)'() {

  }

  @test
  async 'execute remote task and wait for results (task error)'() {
    const _url = URL + '/api' + API_CTRL_TASK_EXEC
        .replace(':taskName', 'simple_task_with_error')
      + '?options=' + JSON.stringify(<ITaskExectorOptions>{waitForRemoteResults: true});

    try {
      const runnerResults: ITaskRunnerResult[] = await request.get(_url,
        {passBody: true, json: true}) as any;
      expect(true).to.be.eq(false);
    } catch (err) {
      const body = err.body;
      expect(body.message).to.be.eq('never ready');
    }
  }


  @test
  async 'execute remote task and wait for results (task error, skip throw)'() {
    const _url = URL + '/api' + API_CTRL_TASK_EXEC
        .replace(':taskName', 'simple_task_with_error')
      + '?options=' + JSON.stringify(<ITaskExectorOptions>{skipThrow: true, waitForRemoteResults: true});

    const runnerResults: ITaskRunnerResult[] = await request.get(_url, {passBody: true, json: true}) as any;
    expect(runnerResults).to.have.length(1);
    expect(runnerResults[0].results).to.have.length(1);
    expect(runnerResults[0].results[0].error).to.not.be.empty;
    expect(runnerResults[0].results[0].error).to.be.deep.include({
      'className': 'Error',
      'message': 'never ready'
    });
  }


  @test
  async 'get remote log content (default tail 50)'() {
    const exec = Injector.create(TaskExecutor);
    const events = await exec
      .create(
        ['simple_task'],
        {},
        {
          remote: true,
          waitForRemoteResults: true,
          skipTargetCheck: true
        })
      .run() as ITaskRunnerResult[];

    const event = events.shift();
    // console.log(inspect(event, null, 10));

    const _urlLog = URL + '/api' + API_CTRL_TASK_LOG
      .replace(':nodeId', event.nodeId)
      .replace(':runnerId', event.id);

    const taskEvent = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];
    // expect(taskEvent).to.not.be.null;
    // taskEvent = taskEvent.body;
    // console.log(inspect(taskEvent, null, 10));
    expect(taskEvent).to.have.length(1);
    const te = taskEvent.shift();
    expect(te).to.contain('"message":"taskRef start: simple_task"');
  }


  @test
  async 'error on try get remote log content'() {
    const _urlLog = URL + '/api' + API_CTRL_TASK_LOG
      .replace(':nodeId', 'fake_app_node_tasks')
      .replace(':runnerId', 'none_existing_runnerid');

    const taskEvent = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];
    // expect(taskEvent).to.not.be.null;
    // taskEvent = taskEvent.body;
    // console.log(inspect(taskEvent, null, 10));
    expect(taskEvent).to.have.length(1);
    const te = taskEvent.shift();
    expect(te).to.contain('"message":"taskRef start: simple_task"');
  }

  @test
  async 'get all active runners'() {
    const _urlLog = URL + '/api' + API_CTRL_TASKS_RUNNERS_INFO;
    const runnersStatus = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];

    const exec = Injector.create(TaskExecutor);
    const executionEvent = await exec
      .create(
        ['simple_task_with_timeout'],
        {timeout: 1000},
        {
          remote: true,
          skipTargetCheck: true,
          waitForRemoteResults: false
        })
      .run() as TaskEvent[];


    await TestHelper.wait(200);
    const runnersStatus2 = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];
    await TestHelper.wait(1000);
    expect(runnersStatus).to.have.length(0);

    expect(executionEvent).to.have.length(1);
    expect(executionEvent[0]).to.deep.include({
      state: 'enqueue',
      taskSpec: ['simple_task_with_timeout'],
      parameters: {timeout: 1000},
      nodeId: 'fake_app_node_tasks',
      targetIds: ['server'],
      respId: 'fake_app_node_tasks',
    });
    expect(runnersStatus2).to.have.length(1);
    expect(runnersStatus2[0]).to.deep.include({
      state: 'running',
      callerId: 'server',
      nodeId: 'fake_app_node_tasks',
      targetIds: ['fake_app_node_tasks'],
      tasks: ['simple_task_with_timeout'],
    });
  }


  @test.skip
  async 'get task status information'() {
  }


  @test.skip
  async 'get remote log file for a task'() {
  }


  @test.skip
  async 'get remote log file content for a task'() {
  }


  @test
  async 'get all runnings tasks'() {
    const _urlLog = URL + '/api' + API_CTRL_TASKS_RUNNING;
    const runningTasks = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];

    const exec = Injector.create(TaskExecutor);
    const executionEvent = await exec
      .create(
        ['simple_task_with_timeout'],
        {timeout: 1000},
        {
          remote: true,
          skipTargetCheck: true,
          waitForRemoteResults: false
        })
      .run() as TaskEvent[];


    await TestHelper.wait(200);
    const runningTasks2 = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];
    await TestHelper.wait(1000);
    // console.log(inspect(runningTasks, false, 10));
    // console.log(inspect(executionEvent, false, 10));
    // console.log(inspect(runningTasks2, false, 10));

    expect(runningTasks).to.have.length(0);

    expect(executionEvent).to.have.length(1);
    expect(executionEvent[0]).to.deep.include({
      state: 'enqueue',
      taskSpec: ['simple_task_with_timeout'],
      parameters: {timeout: 1000},
      nodeId: 'fake_app_node_tasks',
      targetIds: ['server'],
      respId: 'fake_app_node_tasks',
    });
    expect(runningTasks2).to.have.length(2);
    expect(runningTasks2[0]).to.deep.include({
      skipping: false,
      state: 'running',
      taskNames: ['simple_task_with_timeout'],
      running: ['simple_task_with_timeout'],
      finished: [],
      nodeId: 'fake_app_node_tasks',
    });
  }

  @test
  async 'get runnings tasks from own node'() {
    const _urlLog = URL + '/api' + API_CTRL_TASKS_RUNNING_ON_NODE.replace(':nodeId', 'server');
    const runningTasks = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];

    const exec = Injector.create(TaskExecutor);
    const executionEvent = await exec
      .create(
        ['simple_task_with_timeout'],
        {timeout: 1000},
        {
          remote: true,
          skipTargetCheck: true,
          waitForRemoteResults: false
        })
      .run() as TaskEvent[];


    await TestHelper.wait(200);
    const runningTasks2 = (await request.get(_urlLog, {json: true, passBody: true})) as unknown as any[];
    await TestHelper.wait(1000);
    expect(runningTasks).to.have.length(0);

    expect(executionEvent).to.have.length(1);
    expect(executionEvent[0]).to.deep.include({
      state: 'enqueue',
      taskSpec: ['simple_task_with_timeout'],
      parameters: {timeout: 1000},
      nodeId: 'fake_app_node_tasks',
      targetIds: ['server'],
      respId: 'fake_app_node_tasks',
    });
    expect(runningTasks2).to.have.length(1);
    expect(runningTasks2[0]).to.deep.include({
      skipping: false,
      state: 'running',
      taskNames: ['simple_task_with_timeout'],
      running: ['simple_task_with_timeout'],
      finished: [],
      nodeId: 'fake_app_node_tasks',
    });
  }

}

