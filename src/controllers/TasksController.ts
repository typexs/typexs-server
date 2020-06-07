import * as _ from 'lodash';

import {Get, HttpError, InternalServerError, JsonController, Param, QueryParam} from 'routing-controllers';
import {Cache, Container, IMessageOptions, Inject, Injector, Invoker, TaskRunnerRegistry, Tasks, TasksExchange} from '@typexs/base';
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
  _API_TASKS_RUNNING_ON_NODE,
  Access,
  ContextGroup,
  PERMISSION_ALLOW_TASK_EXEC,
  PERMISSION_ALLOW_TASK_EXEC_PATTERN,
  PERMISSION_ALLOW_TASK_GET_METADATA,
  PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN,
  PERMISSION_ALLOW_TASK_LOG,
  PERMISSION_ALLOW_TASK_STATUS,
  PERMISSION_ALLOW_TASKS_LIST,
  PERMISSION_ALLOW_TASKS_METADATA,
  PERMISSION_ALLOW_TASKS_RUNNING
} from '..';
import {TasksHelper} from '@typexs/base/libs/tasks/TasksHelper';
import {IValueProvider} from '@typexs/base/libs/tasks/decorators/IValueProvider';
import {ITaskExectorOptions} from '@typexs/base/libs/tasks/ITaskExectorOptions';
import {TaskExecutor} from '@typexs/base/libs/tasks/TaskExecutor';
import {IError} from '@typexs/base/libs/exceptions/IError';

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

  @Inject(() => TasksExchange)
  taskExchange: TasksExchange;


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


  /**
   * Execute a single task
   *
   * @param taskName
   * @param parameters
   * @param targetIds - depracated
   * @param options
   */
  @Access([PERMISSION_ALLOW_TASK_EXEC, PERMISSION_ALLOW_TASK_EXEC_PATTERN])
  @Get(_API_TASK_EXEC)
  async executeTask(@Param('taskName') taskName: string,
                    @QueryParam('params') parameters: any = {},
                    @QueryParam('targetIds') targetIds: string[] = [],
                    @QueryParam('options') options: ITaskExectorOptions = {}) {
    // arguments
    // const execReq = this.taskFactory.executeRequest();
    options = _.defaults(options, <ITaskExectorOptions>{
      waitForRemoteResults: false,
      skipTargetCheck: false
    });

    if (targetIds && _.isArray(targetIds) && targetIds.length > 0) {
      options.targetIds = targetIds;
    }

    // as start only
    try {
      const executor = Injector.create(TaskExecutor);
      const taskEvent: any[] = await executor
        .create(
          [taskName],
          parameters,
          options)
        .run() as any[];

      // check if error happened
      if (!_.get(options, 'skipThrow', false)) {
        if (taskEvent && _.isArray(taskEvent)) {

          let errors: IError[] = [];
          if (!_.get(options, 'waitForRemoteResults', false)) {
            errors = _.concat([], ...taskEvent.map(x => _.get(x, 'errors', [])));
          } else {
            errors = _.concat([], ...taskEvent.map(x => _.get(x, 'results', []).map((y: any) => y.error))).filter(x => !!x);
          }

          if (errors.length > 0) {
            throw new InternalServerError(errors.map(e => e.message
              + (e.data ? JSON.stringify(e.data) : '')).join('\n'));
          }
        }
      }

      return taskEvent;
    } catch (e) {
      throw new InternalServerError(e.message);
    }
  }

  //
  // TODO: Implement execution of multiple tasks
  //


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
  async getLogContent(@Param('nodeId') nodeId: string,
                      @Param('runnerId') runnerId: string,
                      @QueryParam('limit') limitLine: number = null,
                      @QueryParam('offset') offsetLine: number = null,
                      @QueryParam('tail') tail: number = 50) {

    try {
      const responses = await this.taskExchange.getLogFile(runnerId,
        {
          targetIds: [nodeId],
          outputMode: 'only_value',
          filterErrors: true,
          tail: tail,
          offset: offsetLine,
          limit: limitLine
        });
      return responses;
    } catch (e) {
      throw new HttpError(404, e.message);
    }


  }


  /**
   * Returns the status of a task runner by runner id
   *
   * @param runnerId
   * @param runnerId
   */
  @Access(PERMISSION_ALLOW_TASK_STATUS)
  @Get(_API_TASK_STATUS)
  async getTaskStatus(
    @Param('runnerId') runnerId: string,
    @QueryParam('options') options: IMessageOptions = {},
  ) {
    let _opts = options || {};
    _opts = _.defaults(_opts, <IMessageOptions>{
      filterErrors: true
    });
    try {
      const status = await this.taskExchange.getStatus(runnerId, _opts);
      return status.filter(x => !!x);
    } catch (e) {
      throw new InternalServerError(e.message);
    }

  }


  /**
   * Return the running tasks for node
   *
   * @param nodeId
   */
  @Access([PERMISSION_ALLOW_TASKS_RUNNING])
  @Get(_API_TASKS_RUNNING_ON_NODE)
  async getRunningTasksByNode(@Param('nodeId') nodeId: string,
                              @QueryParam('options') options: IMessageOptions = {}) {

    let _opts = options || {};
    _opts = _.defaults(_opts, <IMessageOptions>{
      filterErrors: true,
      targetIds: [nodeId]
    });
    return this.getRunningTasks(_opts);
  }


  /**
   * Return the running tasks for node
   *
   * @param nodeId
   */
  @Access([PERMISSION_ALLOW_TASKS_RUNNING])
  @Get(_API_TASKS_RUNNING)
  async getRunningTasks(@QueryParam('options') options: IMessageOptions = {}) {

    let _opts = options || {};
    _opts = _.defaults(_opts, <IMessageOptions>{
      filterErrors: true,
    });
    try {
      return this.taskExchange.getRunningTasks(_opts);
    } catch (e) {
      throw new HttpError(404, e.message);
    }
  }


  /**
   * Return the running tasks for node
   *
   * @param nodeId
   */
  @Access([PERMISSION_ALLOW_TASKS_RUNNING])
  @Get(_API_TASKS_RUNNING)
  async getRunners(@QueryParam('options') options: IMessageOptions = {}) {

    let _opts = options || {};
    _opts = _.defaults(_opts, <IMessageOptions>{
      filterErrors: true,
    });
    try {
      return this.taskExchange.getRunners(_opts);
    } catch (e) {
      throw new HttpError(404, e.message);
    }
  }


}
