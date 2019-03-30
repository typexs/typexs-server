import * as _ from "lodash";
import {Inject, Container, StringOrFunction, PlatformUtils, ClassLoader, Log} from "@typexs/base";
import {ClassType} from "commons-schema-api";

import {WebServer} from "../web/WebServer";
import {IServer} from "./IServer";
import {Helper} from "../Helper";


export class ServerFactory {


  static types: { [key: string]: ClassType<IServer> } = {
    web: WebServer
  };

  static checkFunction(fn: Function) {
    if (_.isFunction(fn)) {
      let names = Object.getOwnPropertyNames(fn.prototype);
      if (_.intersection(names, ['constructor', 'initialize', 'prepare', 'start', 'stop']).length === 5) {
        return true;
      }
    }
    return false;
  }

  /**
   * Register a server type
   *
   *
   * @param name
   * @param type
   * @param force
   */
  static register(name: string, type: ClassType<IServer>, force: boolean = true) {
    if (this.types[name]) {
      if (force) {
        Log.warn('overwrite server type ' + name + ' with ' + type.name);
      } else {
        throw new Error('cant overwrite server type ' + name + ' with ' + type.name);
      }
    }
    this.types[name] = type;
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
      if (_.has(this.types, name)) {
        clazz = this.types[name];
      } else if (Helper.FILEPATH_PATTERN.test(name)) {
        let cls = ClassLoader.importClassesFromAny([name + '*']);
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
