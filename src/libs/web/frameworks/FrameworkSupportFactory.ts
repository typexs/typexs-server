import * as _ from "lodash"
import {StringOrFunction,Container} from "typexs-base";
import {IFrameworkSupport} from "./IFrameworkSupport";
import {ExpressSupport} from "./express/ExpressSupport";

export class FrameworkSupportFactory {


  static get(name: StringOrFunction): IFrameworkSupport {
    if (_.isString(name)) {
      switch (name) {
        case "express":
          return Container.get(ExpressSupport);
        default:
          throw new Error('server type');
      }
    } else {
      return Reflect.construct(name, [])
    }
  }

}
