import {MetaArgs} from "@typexs/base";
import {K_META_CONTEXT_ARGS, K_META_PERMISSIONS_ARGS} from "../types";
import * as _ from "lodash";
import {Authorized} from "routing-controllers";


export function Access(permissions?: string | string[] | Function): Function {
  return function (clsOrObject: Function | Object, method?: string) {
    MetaArgs.key(K_META_PERMISSIONS_ARGS).push({
      target: method ? clsOrObject.constructor : clsOrObject as Function,
      method: method,
      accessPermissions: _.isArray(permissions) ? permissions : [permissions]
    });
    /* if permissions are necassery then also authorization */
    Authorized()(clsOrObject, method);
  };
}
