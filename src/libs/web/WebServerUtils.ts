import * as _ from 'lodash';


export class WebServerUtils {

  static checkIfFrameworkIsSet(options: any) {
    return _.has(options, 'framework') && (_.isString(options.framework) || _.isFunction(options.framework));
  }
}
