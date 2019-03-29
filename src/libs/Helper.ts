import * as _ from "lodash";
import {C_DEFAULT} from "./Constants";
import {MetaArgs} from "commons-base/browser";
import {K_META_CONTEXT_ARGS} from "./Constants";
import {Stats} from "fs";
import * as fs from "fs";


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


  static async tail(filepath: string, maxlines: number = -1, encoding: string = 'utf8') {
    let stat: Stats = null;
    let file: number = null;
    const NEW_LINE_CHARACTERS = ["\n", "\r"];

    const readPreviousChar = (stat: Stats, file: number, currentCharacterCount: number) => {
      return new Promise((resolve, reject) => {
        fs.read(file, Buffer.alloc(1), 0, 1, stat.size - 1 - currentCharacterCount, (err: Error, bytesRead: number, buffer: Buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer.toString());
          }
        })
      })
    };

    if (!fs.existsSync(filepath)) {
      throw new Error("file does not exist");
    }

    stat = await new Promise((resolve, reject) => fs.stat(filepath, (err: Error, res: Stats) => err ? reject(err) : resolve(res)));
    file = await new Promise((resolve, reject) => fs.open(filepath, "r", (err: Error, res: number) => err ? reject(err) : resolve(res)));

    let chars = 0;
    let lineCount = 0;
    let lines = "";

    const do_while_loop = async (): Promise<Buffer | string> => {
      if (lines.length > stat.size) {
        lines = lines.substring(lines.length - stat.size);
      }

      if (lines.length >= stat.size || (lineCount >= maxlines - 1 && maxlines - 1 >= 0)) {
        if (_.includes(NEW_LINE_CHARACTERS, lines.substring(0, 1))) {
          lines = lines.substring(1);
        }
        await new Promise((resolve, reject) => fs.close(file, err => err ? reject(err) : resolve()));
        if (encoding === "buffer") {
          return Buffer.from(lines, "binary");
        }
        return Buffer.from(lines, "binary").toString(encoding);
      }

      return readPreviousChar(stat, file, chars)
        .then((nextCharacter) => {
          lines = nextCharacter + lines;
          if (_.includes(NEW_LINE_CHARACTERS, nextCharacter) && lines.length > 1) {
            lineCount++;
          }
          chars++;
        })
        .then(do_while_loop);
    };

    return do_while_loop();

  }


}
