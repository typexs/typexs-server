import * as _ from "lodash";
import {C_DEFAULT, K_META_CONTEXT_ARGS} from "../types";
import {MetaArgs} from "@typexs/base";


export class Helper {

  static FILEPATH_PATTERN = /^(\.|\.\/|\/)([\w\/\.\-_ ]*)$/;

  static resolveGroups(classes: Function[]) {
    let grouped = MetaArgs.key(K_META_CONTEXT_ARGS);
    let groups: any = {}
    for (let clazz of classes) {
      let group = C_DEFAULT;
      for (let entry of grouped) {
        if (entry.target === clazz) {
          group = entry.ctxtGroup;
        }
      }
      if (!_.has(groups, group)) {
        groups[group] = [];
      }
      groups[group].push(clazz);
    }
    return groups;
  }


  // todo move this to commons-base
  static walk(root: any, fn: Function) {
    function walk(obj: any, parent: any = null, key: string | number = null, location: any[] = []) {
      if (obj === null || obj === undefined) return;
      if (_.isArray(obj)) {
        obj.forEach((el: any, j: number) => {
          let isLeaf = !_.isArray(el) && !_.isPlainObject(el);
          fn({
            value: el,
            key: key,
            index: j,
            location: [...location, ...[j]],
            parent: obj,
            isLeaf: isLeaf
          });
          if (!isLeaf) {
            walk(el, j, el, key ? [...location, ...[key], ...[j]] : [...location, ...[j]])
          }

        })

      } else if (_.isPlainObject(obj)) {
        _.keys(obj).forEach(_key => {
          let isLeaf = !_.isArray(obj[_key]) && !_.isPlainObject(obj[_key]);
          fn({
            value: obj[_key],
            key: _key,
            parent: obj,
            index: null,
            location: [...location, ...[_key]],
            isLeaf: isLeaf
          });
          if (!isLeaf) {
            walk(obj[_key], obj, _key, [...location, ...[_key]])
          }

        })

      } else {
        fn({
          value: obj,
          key: key,
          parent: parent,
          index: null,
          location: [...location],
          isLeaf: true
        })

      }
    }

    walk(root)
  }



}
