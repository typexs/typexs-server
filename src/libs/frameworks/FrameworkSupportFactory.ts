import * as _ from "lodash"
import {StringOrFunction} from "typexs-base";
import {IFrameworkSupportOptions} from "./IFrameworkSupportOptions";
import {IFrameworkSupport} from "./IFrameworkSupport";
import {ExpressSupport} from "./express/ExpressSupport";

export class FrameworkSupportFactory {


  get(name: StringOrFunction, options?: IFrameworkSupportOptions): IFrameworkSupport {
    if (_.isString(name)) {
      switch (name) {
        case "express":
          return new ExpressSupport(options);
        default:
          throw new Error('server type');
      }
    } else {
      return Reflect.construct(name, [options])
    }
  }

}
