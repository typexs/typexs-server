import {Incoming, ITask, ITaskRuntimeContainer, TaskRuntime} from '@typexs/base';
import {TestHelper} from '../../../TestHelper';
import {VProvider} from '../libs/VProvider';


export class LocalSimpleTaskWithParams implements ITask {

  name = 'local_simple_task_with_params';

  @TaskRuntime()
  r: ITaskRuntimeContainer;

  @Incoming({optional: true, valueProvider: ['One', 'Two', 'Tree']})
  valueStatic: string;

  @Incoming({optional: true, valueProvider: () => ['One1', 'Two2', 'Tree3']})
  valueFunction: string;

  @Incoming({optional: true, valueProvider: VProvider})
  valueClass: string;

  async exec() {
    const logger = this.r.logger();
    await TestHelper.wait(100);

    logger.info('task is running');

    this.r.progress(50);


    return {task: 'great local run'};
  }
}
