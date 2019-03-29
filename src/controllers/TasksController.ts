import * as _ from 'lodash';

import {Get, HttpError, JsonController, Param, QueryParam} from "routing-controllers";
import {
  C_STORAGE_DEFAULT,
  Cache,
  Container,
  Inject,
  Invoker,
  Log,
  PlatformUtils,
  StorageRef,
  TaskLog,
  Tasks
} from "@typexs/base";
import {
  _API_TASK_EXEC,
  _API_TASK_GET_METADATA,
  _API_TASK_LOG,
  _API_TASK_STATUS,
  _API_TASKS,
  _API_TASKS_LIST,
  _API_TASKS_METADATA,
  Access,
  ContextGroup,
  Helper,
  PERMISSION_ALLOW_TASK_EXEC,
  PERMISSION_ALLOW_TASK_EXEC_PATTERN,
  PERMISSION_ALLOW_TASK_GET_METADATA,
  PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN,
  PERMISSION_ALLOW_TASK_LOG,
  PERMISSION_ALLOW_TASK_STATUS,
  PERMISSION_ALLOW_TASKS_LIST,
  PERMISSION_ALLOW_TASKS_METADATA
} from "..";
import {TaskExecutionRequestFactory} from "@typexs/base/libs/tasks/worker/TaskExecutionRequestFactory";
import {TasksHelper} from "@typexs/base/libs/tasks/TasksHelper";


@ContextGroup('api')
@JsonController(_API_TASKS)
export class TasksController {

  @Inject(Tasks.NAME)
  tasks: Tasks;

  @Inject(Invoker.NAME)
  invoker: Invoker;


  @Inject(Cache.NAME)
  cache: Cache;

  @Inject()
  taskFactory: TaskExecutionRequestFactory;

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

  @Access([PERMISSION_ALLOW_TASK_GET_METADATA, PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN])
  @Get(_API_TASK_GET_METADATA)
  taskMetadata(@Param('taskName') taskName: string) {
    if (this.tasks.contains(taskName)) {
      return this.tasks.get(taskName).toJson();
    }
    return {};
  }

  @Access([PERMISSION_ALLOW_TASK_EXEC, PERMISSION_ALLOW_TASK_EXEC_PATTERN])
  @Get(_API_TASK_EXEC)
  async execute(@Param('taskName') taskName: string,
                @QueryParam('parameters') parameters: any = {},
                @QueryParam('targetIds') targetIds: string[] = []) {
    // arguments
    let execReq = this.taskFactory.createRequest();
    let taskEvent = await execReq.run([taskName], parameters, targetIds);
    return taskEvent.shift();
  }


  @Access(PERMISSION_ALLOW_TASK_LOG)
  @Get(_API_TASK_LOG)
  async log(@Param('nodeId') nodeId: string,
            @Param('runnerId') runnerId: string,
            @QueryParam('tail') number: any = 50) {

    // if tail is lower then 1 then print all, this works only if monitor exists
    let filename = TasksController.getTaskLogFile(runnerId, nodeId);
    if (PlatformUtils.fileExist(filename)) {
      let content = <string>await Helper.tail(filename, number);
      if (content) {
        try {
          return content.split('\n').filter(x => !_.isEmpty(x)).map(x => JSON.parse(x.trim()))
        } catch (err) {
          Log.error(err);
          throw new HttpError(500, err.message);
        }

      } else {
        throw new HttpError(204, 'not content in logfile')
      }
    }

    Log.error('taskscontroller: log file not found ' + filename);
    throw new HttpError(404, 'log file not found');
  }


  @Access(PERMISSION_ALLOW_TASK_STATUS)
  @Get(_API_TASK_STATUS)
  async status(@Param('nodeId') nodeId: string,
               @Param('runnerId') runnerId: string) {
    let storageRef: StorageRef = Container.get(C_STORAGE_DEFAULT);
    let entry = <TaskLog>await storageRef.getController().findOne(TaskLog, {respId: nodeId, tasksId: runnerId});
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


  static getTaskLogFile(runnerId: string, nodeId: string) {
    return TasksHelper.getTaskLogFile(runnerId,nodeId);
  }

}
