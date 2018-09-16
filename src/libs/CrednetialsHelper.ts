import {Action, getMetadataArgsStorage} from "routing-controllers";
import {MetaArgs} from "typexs-base";
import {K_META_CREDENTIALS_ARGS} from "../types";
import * as _ from "lodash";


export class CredentialsHelper {

  static getRightsForAction(action: Action): string[] {
    let actions = getMetadataArgsStorage().actions;
    let actionMetadatas = actions.filter(x => x.type == action.request.method.toLowerCase() && x.route == action.request.route.path);

    if (!_.isEmpty(actionMetadatas)) {
      let targets = actionMetadatas.map(x => x.target);
      let methods = actionMetadatas.map(x => x.method);
      let params = action.request.params;
      let credentials = MetaArgs.key(K_META_CREDENTIALS_ARGS)
        .find(x => targets.indexOf(x.target) != -1 &&
          methods.indexOf(x.method) != -1);
      if (credentials) {
        return _.map(credentials.rights, right => {
          Object.keys(params).forEach(p => {
            right = right.replace(':' + p, params[p])
          })
          return right;
        });
      }
    }
    return [];
  }
}
