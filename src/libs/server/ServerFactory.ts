import * as _ from 'lodash';
import {ClassLoader, Injector, Log, StringOrFunction} from '@typexs/base';
import {ClassType} from '@allgemein/schema-api';

import {WebServer} from '../web/WebServer';
import {IServer} from './IServer';
import {Helper} from '../Helper';


export class ServerFactory {


  static types: { [key: string]: Function } = null;

  constructor() {
    if (!ServerFactory.types) {
      ServerFactory.types = {};
      ServerFactory.register('web', WebServer);
    }
  }

  static checkFunction(fn: Function) {
    if (_.isFunction(fn)) {
      const names = Object.getOwnPropertyNames(fn.prototype);
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
    if (ServerFactory.types[name]) {
      if (force) {
        Log.warn('overwrite server type ' + name + ' with ' + type.name);
      } else {
        Log.error('cant overwrite server type ' + name + ' with ' + type.name);
        return;
      }
    }
    ServerFactory.types[name] = type;
  }


  static checkType(name: StringOrFunction) {
    const clazz = this.getServerClass(name);
    if (clazz) {
      return this.checkFunction(clazz);
    }
    return false;
  }


  static getServerClass(name: StringOrFunction): Function {
    let clazz = null;
    if (_.isString(name)) {
      if (_.has(ServerFactory.types, name)) {
        clazz = _.get(ServerFactory.types, name);
      } else if (Helper.FILEPATH_PATTERN.test(name)) {
        const cls = ClassLoader.importClassesFromAny([name + '*']);
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
    const instance = ServerFactory.getServerClass(name);
    if (instance) {
      return Injector.get(instance);
    }
    throw new Error('can not find server class');
  }

}
