import * as _ from 'lodash';
import {InternalServerError} from 'routing-controllers';

export class HttpResponseError extends InternalServerError {

  context: string[];

  objects: any[];

  constructor(ctxt: string | string[], msg: string, ...data: any[]) {
    super(msg);
    Object.setPrototypeOf(this, HttpResponseError.prototype);
    this.context = _.isArray(ctxt) ? ctxt : [ctxt];
    this.objects = data;
  }


  toJSON() {
    return {
      status: this.httpCode,
      context: this.context.join('.'),
      message: this.message,
      data: this.objects
    };
  }
}
