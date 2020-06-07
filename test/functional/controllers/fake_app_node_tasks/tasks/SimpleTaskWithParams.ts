import {ITask, ITaskRuntimeContainer, TaskRuntime, Incoming, Outgoing} from '@typexs/base';
import {TestHelper} from '../../../TestHelper';


export class SimpleTaskWithParams implements ITask {

  name = 'simple_task_with_params';

  @TaskRuntime()
  r: ITaskRuntimeContainer;

  @Incoming()
  needThis: any;

  @Outgoing()
  forOthers: any;

  async exec() {
    const logger = this.r.logger();
    await TestHelper.wait(100);
    logger.info('task is running with parameter ' + JSON.stringify(this.needThis));

    this.r.progress(50);

    this.forOthers = 'best regards Robert';


    return {task: 'great run with parameters'};
  }
}
