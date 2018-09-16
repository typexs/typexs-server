import {MetaArgs} from "typexs-base";
import {K_META_CONTEXT_ARGS, K_META_CREDENTIALS_ARGS} from "../types";
import * as _ from "lodash";
import {Authorized} from "routing-controllers";


export function Credentials(roleOrRoles?: string | string[] | Function): Function {
  return function (clsOrObject: Function | Object, method?: string) {
    MetaArgs.key(K_META_CREDENTIALS_ARGS).push({
      target: method ? clsOrObject.constructor : clsOrObject as Function,
      method: method,
      rights: _.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles]
    });
    /* if credentials are necassery then also authorization */
    Authorized()(clsOrObject, method);
  };
}
