
import {NestedException} from '@typexs/base';

export class ServerTypeIsNotSetError extends NestedException {

  constructor() {
    super(new Error('server type is not defined'), 'SERVER_TYPE_IS_NO_SET');
  }
}
