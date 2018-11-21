import {Action, getMetadataArgsStorage} from "routing-controllers";
import {MetaArgs} from "@typexs/base";
import {K_META_PERMISSIONS_ARGS} from "../types";
import * as _ from "lodash";


export class PermissionsHelper {


  static getRightsForAction(action: Action): string[] {
    let actions = getMetadataArgsStorage().actions;
    let actionMetadatas = actions.filter(x => x.type == action.request.method.toLowerCase() && x.route == action.request.route.path);

    if (!_.isEmpty(actionMetadatas)) {
      let targets = actionMetadatas.map(x => x.target);
      let methods = actionMetadatas.map(x => x.method);
      let params = action.request.params;
      let permissions = MetaArgs.key(K_META_PERMISSIONS_ARGS)
        .find(x => targets.indexOf(x.target) != -1 &&
          methods.indexOf(x.method) != -1);
      if (permissions) {
        return _.map(permissions.accessPermissions, right => {
          Object.keys(params).forEach(p => {
            right = right.replace(':' + p, params[p])
          })
          return right;
        });
      }
    }
    return [];
  }

  static getPermissionFor(target: Function, methodName: string): any {
    let permissions = MetaArgs.key(K_META_PERMISSIONS_ARGS)
      .find(x => x.target == target &&
        methodName == x.method);
    return permissions;
  }

}
