import * as _ from "lodash";
import {Inject, Container, StringOrFunction, PlatformUtils, ClassLoader} from "typexs-base";
import {WebServer} from "../web/WebServer";
import {IServer} from "./IServer";
import {Helper} from "../Helper";


export class ServerFactory {





  static checkFunction(fn: Function) {
    if (_.isFunction(fn)) {
      let names = Object.getOwnPropertyNames(fn.prototype);
      if (_.intersection(names, ['constructor', 'initialize', 'prepare', 'start', 'stop']).length === 5) {
        return true;
      }
    }
    return false;
  }


  static checkType(name: StringOrFunction) {
    let clazz = this.getServerClass(name);
    if (clazz) {
      return this.checkFunction(clazz);
    }
    return false;
  }


  static getServerClass(name: StringOrFunction): Function {
    let clazz = null;
    if (_.isString(name)) {
      if (name === 'web') {
        clazz = WebServer;
      } else if (Helper.FILEPATH_PATTERN.test(name)) {
        let cls = ClassLoader.importClassesFromAny([name+'*']);
        if (!_.isEmpty(cls)) {
          clazz = cls.shift();
        }
      }
    } else {
      clazz = name;
    }

    if (clazz && this.checkFunction(clazz)) {
      return clazz;
    }
    return null;
  }


  get(name: StringOrFunction): IServer {
    let instance = ServerFactory.getServerClass(name);
    if (instance) {
      return Container.get(instance);
    }
    throw new Error('can not find server class');
  }

}
