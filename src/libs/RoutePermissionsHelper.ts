import {Action} from 'routing-controllers';
import {MetaArgs} from 'commons-base/browser';
import {K_META_PERMISSIONS_ARGS, K_ROUTE_CACHE} from './Constants';
import * as _ from 'lodash';


export class RoutePermissionsHelper {


  static getPermissionsForAction(action: Action): string[] {
    const actions = MetaArgs.key(K_ROUTE_CACHE);

    const actionMetadatas = actions.filter(
      x => x.method === action.request.method.toLowerCase() &&
        x.route === action.request.route.path);

    if (!_.isEmpty(actionMetadatas)) {
      const params = action.request.params;
      let permissions: string[] = [];
      actionMetadatas.map(p => p.permissions && _.isArray(p.permissions) ? permissions = permissions.concat(p.permissions) : null);
      if (!_.isEmpty(permissions)) {
        return _.map(permissions, right => {
          Object.keys(params).forEach(p => {
            right = right.replace(':' + p, params[p]);
          });
          return right;
        });
      }
    }
    return [];
  }

  static getPermissionFor(target: Function, methodName: string): any {
    const permissions = MetaArgs.key(K_META_PERMISSIONS_ARGS)
      .find(x => x.target === target &&
        methodName === x.method);
    return permissions;
  }

}
