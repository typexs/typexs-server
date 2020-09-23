import * as _ from 'lodash';
import {DEFAULT_ANONYMOUS} from '../Constants';


export class ServerUtils {

  static checkIfTypeIsSet(options: any) {
    return _.has(options, 'type') && (_.isString(options.type) || _.isFunction(options.type));
  }

  static isAnonymous(user: any) {
    return !user || (_.isString(user) && user === DEFAULT_ANONYMOUS);
  }

  static hasPermissionCheck(user: any) {
    return !ServerUtils.isAnonymous(user) || _.isNull(user) || _.isUndefined(user);
  }

}
