import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

//process.env.SQL_LOG = '1';
import {suite, test} from "mocha-typescript";
import {Bootstrap, C_STORAGE_DEFAULT, Config, Container, StorageRef, TaskLog} from "@typexs/base";
import {
  API_TASK_EXEC,
  API_TASK_GET_METADATA,
  API_TASK_LOG,
  API_TASK_STATUS, API_TASKS_METADATA,
  K_ROUTE_CONTROLLER
} from "../../../src/libs/Constants";
import * as request from "request-promise";
import {expect} from "chai";
import {Helper, WebServer} from "../../../src";
import * as _ from "lodash";
import {SpawnHandle} from "../SpawnHandle";
import {TestHelper} from "../TestHelper";
import {TEST_STORAGE_OPTIONS} from "../config";
import {EventBus, IEventBusConfiguration} from "commons-eventbus";
import {
  API_TASKS_LIST} from "../../../src/libs/Constants";
import {TaskEvent} from "@typexs/base/libs/tasks/worker/TaskEvent";

import subscribe from "commons-eventbus/decorator/subscribe";
import {inspect} from "util";

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
  //workers: {access: [{name: 'TaskMonitorWorker', access: 'allow'}]},
  eventbus: {default: <IEventBusConfiguration>{adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}}},

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;


@suite('functional/controllers/tasks_controller')
class Tasks_controllerSpec {


  static async before() {
    let settings = _.clone(settingsTemplate);


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


  @test
  async 'get tasks list and metadata (local and remote)'() {
    const url = server.url();

    let _url = (url + '/api' + API_TASKS_LIST);
    let _urlTaskLocal = (url + '/api' + API_TASK_GET_METADATA.replace(':taskName', 'local_simple_task'));
    let _urlTaskRemote = (url + '/api' + API_TASK_GET_METADATA.replace(':taskName', 'simple_task'));
    let _urlTasks = (url + '/api' + API_TASKS_METADATA);
    let rBefore = await request.get(_url, {json: true});

    let p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);

    let rAfter = await request.get(_url, {json: true});

    let rTasks = await request.get(_urlTasks, {json: true});
    let rTaskLocal = await request.get(_urlTaskLocal, {json: true});
    let rTaskRemote = await request.get(_urlTaskRemote, {json: true});


    p.shutdown();

    await p.done;
    await TestHelper.wait(50);

    let rFinished = await request.get(_url, {json: true});

    expect(rTasks).to.have.length(3);
    expect(rTaskLocal).to.deep.include({
        "id": "local_simple_task",
        "name": "local_simple_task",
        "type": "entity",
        "machineName": "local_simple_task",
        "options": {},
        "mode": "1",
        "hasWorker": false,
        "permissions": null,
        "description": null,
        "remote": null,
        "groups": [],
        "nodeIds": [
          "server"
        ],
        "target": {
          "schema": "default",
          "className": "LocalSimpleTask",
          "isEntity": false,
          "options": {}
        },
        "properties": [
          {
            "id": "r",
            "name": "r",
            "type": "property",
            "machineName": "r",
            "options": {},
            "descriptor": {
              "target": "LocalSimpleTask",
              "propertyName": "r",
              "type": "runtime"
            }
          }
        ]
      }
    );
    expect(rTaskRemote).to.deep.include({
      "id": "simple_task",
      "name": "simple_task",
      "type": "entity",
      "machineName": "simple_task",
      "options": {
        "remote": true
      },
      "mode": "4",
      "hasWorker": false,
      "permissions": null,
      "description": null,
      "remote": true,
      "groups": [],
      "nodeIds": [
        "fake_app_node_tasks"
      ],
      "target": {
        "schema": "default",
        "className": "Object",
        "isEntity": false,
        "options": {}
      },
      "properties": []
    });


    expect(rBefore).to.have.length(1);
    expect(rAfter).to.have.length(3);
    expect(rAfter.find((x: any) => x.name == 'local_simple_task')).to.deep.include({
      name: 'local_simple_task',
      nodeIds: ['server']
    });
    expect(rAfter.find((x: any) => x.name == 'simple_task')).to.deep.include({
      name: 'simple_task',
      nodeIds: ['fake_app_node_tasks'],
      remote: true
    });
    expect(rFinished).to.have.length(1);
    expect(rBefore).to.be.deep.eq(rFinished);
  }


  @test
  async 'tail file content'() {
    let tmpdir = os.tmpdir();
    let content = "";
    for (let x of _.range(1, 500)) {
      content += x + "\n";
    }
    let file = path.join(tmpdir, 'tail_test_file');
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    fs.writeFileSync(file, content);

    let _content: string = <string>await Helper.tail(file);
    expect(_content.split('\n').length).to.eq(500);
    _content = <string>await Helper.tail(file, 50);
    expect(_content.split('\n').length).to.eq(50);
  }


  @test
  async 'start remote task, monitor, log'() {
    const url = server.url();

    let events: TaskEvent[] = [];

    class T02 {
      @subscribe(TaskEvent) on(e: TaskEvent) {
        let _e = _.cloneDeep(e);
        events.push(_e);
      }
    }

    let z = new T02();
    await EventBus.register(z);


    let p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);


    let _url = url + '/api' + API_TASK_EXEC.replace(':taskName', 'simple_task');
    let taskEvent: TaskEvent = await request.get(_url, {json: true});

    let _urlStatus = url + '/api' + API_TASK_STATUS.replace(':nodeId', taskEvent.respId).replace(':runnerId', taskEvent.id);

    await TestHelper.waitFor(() => events.length >= 4, 10);
    let s = await (<StorageRef>Container.get(C_STORAGE_DEFAULT)).getController().find(TaskLog);
    let taskStatus1 = await request.get(_urlStatus, {json: true});


    await TestHelper.waitFor(() => events.length >= 6);

    let _urlLog = url + '/api' + API_TASK_LOG.replace(':nodeId', taskEvent.respId).replace(':runnerId', taskEvent.id);
    let taskLog = await request.get(_urlLog, {json: true});

    let taskStatus2 = await request.get(_urlStatus, {json: true});

    p.shutdown();

    await p.done;
    await EventBus.unregister(z);

    expect(taskStatus1).to.be.deep.include({
      taskName: 'simple_task',
      taskNr: 0,
      nodeId: 'server',
      respId: 'fake_app_node_tasks',
    });
    expect(taskStatus2).to.be.deep.include({
      taskName: 'simple_task',
      taskNr: 0,
      state: 'stopped',
      nodeId: 'server',
      respId: 'fake_app_node_tasks',
      hasError: false,
      progress: 100,
      total: 100,
      done: true,
      running: false,
      data:
        {
          results: {task: 'great run'},
          incoming: {},
          outgoing: {},
          error: null
        }
    });
    expect(taskLog.length).to.be.eq(1);
    expect(taskLog[0]).to.deep.include({
      level: 'info',
      message: 'task is running',
    });
    expect(events.length).to.be.eq(6);
    expect(taskEvent).to.be.deep.include({
      "state": "enqueue",
      "topic": "data",
      "nodeId": "server",
      "name": [
        "simple_task"
      ],
      "targetIds": [
        "fake_app_node_tasks"
      ],
      "respId": "fake_app_node_tasks"
    });
  }


  @test
  async 'start remote task with parameters'() {
    const url = server.url();

    let events: TaskEvent[] = [];

    class T02 {
      @subscribe(TaskEvent) on(e: TaskEvent) {
        let _e = _.cloneDeep(e);
        events.push(_e);
      }
    }

    let z = new T02();
    await EventBus.register(z);

    let p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);

    let _url = url + '/api' + API_TASK_EXEC.replace(':taskName', 'simple_task_with_params') + '?parameters=' + JSON.stringify({need_this: {really: {important: 'data'}}}) + '&targetIds=' + JSON.stringify(['fake_app_node_tasks']);
    let taskEvent: TaskEvent = await request.get(_url, {json: true});

    await TestHelper.waitFor(() => events.length >= 6);

    p.shutdown();
    await p.done;
    await EventBus.unregister(z);

    let _urlStatus = url + '/api' + API_TASK_STATUS.replace(':nodeId', taskEvent.respId).replace(':runnerId', taskEvent.id);
    let taskStatus1 = await request.get(_urlStatus, {json: true});

    expect(taskEvent).to.be.deep.include({
      errors: [],
      state: 'enqueue',
      topic: 'data',
      nodeId: 'server',
      name: ['simple_task_with_params'],
      targetIds: ['fake_app_node_tasks'],
      parameters: {need_this: {really: {important: 'data'}}},
      respId: 'fake_app_node_tasks'
    });

    expect(taskStatus1).to.be.deep.include({
      taskName: 'simple_task_with_params',
      taskNr: 0,
      state: 'stopped',
      nodeId: 'server',
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
  async 'start remote task without necessary parameters'() {
    const url = server.url();

    let events: TaskEvent[] = [];

    class T02 {
      @subscribe(TaskEvent) on(e: TaskEvent) {
        let _e = _.cloneDeep(e);
        events.push(_e);
      }
    }

    let z = new T02();
    await EventBus.register(z);

    let p = SpawnHandle.do(__dirname + '/fake_app_node_tasks/node_tasks.ts').start(LOG_EVENT);
    await p.started;
    await TestHelper.wait(50);

    let _url = url + '/api' + API_TASK_EXEC.replace(':taskName', 'simple_task_with_params') + '?targetIds=' + JSON.stringify(['fake_app_node_tasks']);
    let taskEvent: TaskEvent = await request.get(_url, {json: true});

    p.shutdown();
    await p.done;
    await EventBus.unregister(z);
    expect(taskEvent).to.deep.include({
        errors:
          [{
            context: 'required_parameter',
            data: {required: 'needThis'},
            message: 'The required value is not passed.'
          }],
        state: 'request_error',
        topic: 'data',
        nodeId: 'server',
        name: ['simple_task_with_params'],
        targetIds: ['fake_app_node_tasks'],
        respId: 'fake_app_node_tasks'
      }
    )

  }

}
