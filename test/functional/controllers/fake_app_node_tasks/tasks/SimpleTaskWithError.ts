import {ITask} from '@typexs/base';


export class SimpleTaskWithError implements ITask {

  name = 'simple_task_with_error';

  async exec() {
    throw new Error('never ready');
  }
}
