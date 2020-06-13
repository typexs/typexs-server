import {Incoming, ITask, ITaskRuntimeContainer, TaskRuntime} from '@typexs/base';
import {TestHelper} from '../../../TestHelper';


export class SimpleTaskWithTimeout implements ITask {

  name = 'simple_task_with_timeout';

  @TaskRuntime()
  r: ITaskRuntimeContainer;

  @Incoming({optional: true})
  timeout: number = 1000;

  async exec() {
    const logger = this.r.logger();
    logger.info('task is running');
    this.r.progress(50);

    await TestHelper.wait(this.timeout);

    return {task: 'great run'};
  }
}
