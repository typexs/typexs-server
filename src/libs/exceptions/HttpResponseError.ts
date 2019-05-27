import *as _ from 'lodash';
import {HttpError} from 'routing-controllers/http-error/HttpError';

export class HttpResponseError extends HttpError {

  context: string[];


  objects: any[];

  constructor(ctxt: string | string[], msg: string, ...data: any[]) {
    super(400, msg);
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
