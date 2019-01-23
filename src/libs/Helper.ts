import * as _ from "lodash";
import {C_DEFAULT} from "./Constants";
import {MetaArgs} from "@typexs/base/base/MetaArgs";
import {K_META_CONTEXT_ARGS} from "./Constants";


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


}
