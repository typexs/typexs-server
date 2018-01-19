import {MetaArgs} from "typexs-base";
import {K_META_CONTEXT_ARGS} from "../types";


export function ContextGroup(name: string): Function {
    return function (object: Function) {
      MetaArgs.key(K_META_CONTEXT_ARGS).push({
            target: object,
            ctxtGroup: name
        });
    };
}
