import * as _ from "lodash";


export class ServerUtils {

  static checkIfTypeIsSet(options:any){
    return _.has(options,'type') && (_.isString(options.type) || _.isFunction(options.type));
  }

}
