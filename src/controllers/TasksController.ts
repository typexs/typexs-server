import * as _ from 'lodash';

import {Get, HttpError, JsonController, Param, QueryParam} from 'routing-controllers';
import {
  C_STORAGE_DEFAULT,
  Cache,
  Container,
  FileSystemExchange,
  Inject,
  Invoker,
  Log,
  StorageRef,
  TaskLog,
  TaskRunnerRegistry,
  Tasks,
  TasksExchange
} from '@typexs/base';
import {
  _API_TASK_EXEC,
  _API_TASK_GET_METADATA,
  _API_TASK_GET_METADATA_VALUE,
  _API_TASK_LOG,
  _API_TASK_STATUS,
  _API_TASKS,
  _API_TASKS_LIST,
  _API_TASKS_METADATA,
  _API_TASKS_RUNNING,
  Access,
  ContextGroup,
  PERMISSION_ALLOW_TASK_EXEC,
  PERMISSION_ALLOW_TASK_EXEC_PATTERN,
  PERMISSION_ALLOW_TASK_GET_METADATA,
  PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN,
  PERMISSION_ALLOW_TASK_LOG,
  PERMISSION_ALLOW_TASK_RUNNING,
  PERMISSION_ALLOW_TASK_STATUS,
  PERMISSION_ALLOW_TASKS_LIST,
  PERMISSION_ALLOW_TASKS_METADATA
} from '..';
import {TaskExecutionRequestFactory} from '@typexs/base/libs/tasks/worker/TaskExecutionRequestFactory';
import {TasksHelper} from '@typexs/base/libs/tasks/TasksHelper';
import {IValueProvider} from '@typexs/base/libs/tasks/decorators/IValueProvider';

@ContextGroup('api')
@JsonController(_API_TASKS)
export class TasksController {

  @Inject(Tasks.NAME)
  tasks: Tasks;

  @Inject(TaskRunnerRegistry.NAME)
  taskRunner: TaskRunnerRegistry;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Inject(Cache.NAME)
  cache: Cache;

  @Inject()
  taskFactory: TaskExecutionRequestFactory;

  @Inject(() => TasksExchange)
  taskExchange: TasksExchange;

  @Inject(() => FileSystemExchange)
  fileExchange: FileSystemExchange;

  static getTaskLogFile(runnerId: string, nodeId: string) {
    return TasksHelper.getTaskLogFile(runnerId, nodeId);
  }

  @Access(PERMISSION_ALLOW_TASKS_LIST)
  @Get(_API_TASKS_LIST)
  list() {
    return this.tasks.infos(true);
  }

  @Access(PERMISSION_ALLOW_TASKS_METADATA)
  @Get(_API_TASKS_METADATA)
  tasksMetadata() {
    return this.tasks.toJson();
  }

  @Access([PERMISSION_ALLOW_TASK_GET_METADATA,
    PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN])
  @Get(_API_TASK_GET_METADATA)
  taskMetadata(@Param('taskName') taskName: string) {
    if (this.tasks.contains(taskName)) {
      return this.tasks.get(taskName).toJson();
    }
    return {};
  }


  @Access([PERMISSION_ALLOW_TASK_GET_METADATA,
    PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN])
  @Get(_API_TASK_GET_METADATA_VALUE)
  taskMetadataValueProvider(@Param('taskName') taskName: string,
                            @Param('incomingName') incomingName: string,
                            @QueryParam('values') values: any = null,
                            @QueryParam('hint') hint: any = null) {
    if (!this.tasks.contains(taskName)) {
      throw new HttpError(404, 'No task with this name found');
    }
    const snakeCaseIncoming = _.snakeCase(incomingName);
    const taskRef = this.tasks.get(taskName);
    const taskIncomingRef = taskRef.getIncomings().find(x => _.snakeCase(x.name) === snakeCaseIncoming);

    if (!taskIncomingRef) {
      throw new HttpError(404, 'No task incoming parameter with this name found');
    }

    const valueProvider = taskIncomingRef.getOptions('valueProvider');
    if (!valueProvider) {
      throw new HttpError(404, 'No value provider defined for task incoming parameter');
    }

    if (_.isFunction(valueProvider)) {
      if (valueProvider.prototype && valueProvider.prototype.constructor) {
        // is a class
        const providerInstance = <IValueProvider<any>>Container.get(<any>valueProvider);
        return providerInstance.get(values, taskIncomingRef, hint);
      } else {
        // is a function
        return valueProvider(values, taskIncomingRef, hint);
      }
    } else {
      return valueProvider;
    }
  }


  @Access([PERMISSION_ALLOW_TASK_EXEC, PERMISSION_ALLOW_TASK_EXEC_PATTERN])
  @Get(_API_TASK_EXEC)
  async execute(@Param('taskName') taskName: string,
                @QueryParam('parameters') parameters: any = {},
                @QueryParam('targetIds') targetIds: string[] = []) {
    // arguments
    const execReq = this.taskFactory.createRequest();
    const taskEvent = await execReq.run([taskName], parameters, {targetIds: targetIds, skipTargetCheck: false});
    return taskEvent.shift();
  }


  /**
   * Return the content of the logfile. There are two variants of selecting
   * the content first is by setting "from" with optional "offset" parameter which
   * causes to return the file content between given scale. When "tail" is set you
   * get the last lines passed.
   *
   * Default is 'tail' with 50 lines
   *
   * @param nodeId
   * @param runnerId
   * @param fromLine
   * @param offsetLine
   * @param number
   */
  @Access(PERMISSION_ALLOW_TASK_LOG)
  @Get(_API_TASK_LOG)
  async log(@Param('nodeId') nodeId: string,
            @Param('runnerId') runnerId: string,
            @QueryParam('from') fromLine: number = null,
            @QueryParam('offset') offsetLine: number = null,
            @QueryParam('tail') tail: number = 50) {

    const responses = await this.taskExchange.getLogFilePath(runnerId, {mode: 'only_value', filterErrors: true, skipLocal: false});
    const filename: string = null;


    // // if tail is lower then 1 then print all, this works only if monitor exists
    // const filename = TasksController.getTaskLogFile(runnerId, nodeId);
    // if (PlatformUtils.fileExist(filename)) {
    //   let content: string = null;
    //   if (_.isNumber(fromLine) && _.isNumber(offsetLine)) {
    //     content = <string>await Helper.less(filename, fromLine, offsetLine);
    //   } else if (_.isNumber(fromLine)) {
    //     content = <string>await Helper.less(filename, fromLine, 0);
    //   } else {
    //     content = <string>await Helper.tail(filename, tail ? tail : 50);
    //   }
    //
    //
    //   if (content) {
    //     try {
    //       return content.split('\n').filter(x => !_.isEmpty(x)).map(x => JSON.parse(x.trim()));
    //     } catch (err) {
    //       Log.error(err);
    //       throw new HttpError(500, err.message);
    //     }
    //   } else {
    //     throw new HttpError(204, 'not content in logfile');
    //   }
    // }

    Log.error('taskscontroller: log file not found ' + filename);
    throw new HttpError(404, 'log file not found');
  }


  @Access(PERMISSION_ALLOW_TASK_STATUS)
  @Get(_API_TASK_STATUS)
  async status(@Param('nodeId') nodeId: string,
               @Param('runnerId') runnerId: string) {
    const storageRef: StorageRef = Container.get(C_STORAGE_DEFAULT);
    const entry = <TaskLog>await storageRef.getController().findOne(TaskLog, {respId: nodeId, tasksId: runnerId});
    if (entry) {
      if (_.isString(entry.data)) {
        try {
          entry.data = JSON.parse(entry.data);
        } catch (e) {
        }
      }
      return entry;
    }
    return null;
  }


  /**
   * Return the runnings tasks of all known nodes or only the given one
   *
   * @param nodeId
   */
  @Access(PERMISSION_ALLOW_TASK_RUNNING)
  @Get(_API_TASKS_RUNNING)
  async getRunningTasks(@Param('nodeId') nodeId: string = null) {
    const tasksRunner = [];
    // todo
    if (_.isEmpty(nodeId)) {
      const tasks = this.taskRunner.getRunningTasks();
      for (const t of this.taskRunner.getRunners()) {

      }
    }


  }


}
