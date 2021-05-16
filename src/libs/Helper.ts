import * as _ from 'lodash';
import {C_DEFAULT, K_META_CONTEXT_ARGS} from './Constants';
import {K_INST_ID, K_NODE_ID, MetaArgs} from '@typexs/base';
import * as fs from 'fs';
import {Stats} from 'fs';


export interface WalkValues {
  value: any;
  key: string | number;
  index: number;
  location: any;
  parent: any;
  isLeaf: boolean;
}

export class Helper {

  static FILEPATH_PATTERN = /^(\.|\.\/|\/)([\w\/\.\-_ ]*)$/;

  static resolveGroups(classes: Function[]) {
    const grouped = MetaArgs.key(K_META_CONTEXT_ARGS);
    const groups: any = {};
    for (const clazz of classes) {
      let group = C_DEFAULT;
      for (const entry of grouped) {
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


  static async tail(filepath: string, maxlines: number = -1, encoding: BufferEncoding = 'utf8') {
    let stat: Stats = null;
    let file: number = null;
    const NEW_LINE_CHARACTERS = ['\n', '\r'];

    // tslint:disable-next-line:no-shadowed-variable
    const readPreviousChar = (stat: Stats, file: number, currentCharacterCount: number) => {
      return new Promise((resolve, reject) => {
        fs.read(file, Buffer.alloc(1), 0, 1, stat.size - 1 - currentCharacterCount, (err: Error, bytesRead: number, buffer: Buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer.toString());
          }
        });
      });
    };

    if (!fs.existsSync(filepath)) {
      throw new Error('file does not exist');
    }

    stat = await new Promise((resolve, reject) => fs.stat(filepath, (err: Error, res: Stats) => err ? reject(err) : resolve(res)));
    file = await new Promise((resolve, reject) => fs.open(filepath, 'r', (err: Error, res: number) => err ? reject(err) : resolve(res)));

    let chars = 0;
    let lineCount = 0;
    let lines = '';

    const do_while_loop = async (): Promise<Buffer | string> => {
      if (lines.length > stat.size) {
        lines = lines.substring(lines.length - stat.size);
      }

      if (lines.length >= stat.size || (lineCount >= maxlines - 1 && maxlines - 1 >= 0)) {
        if (_.includes(NEW_LINE_CHARACTERS, lines.substring(0, 1))) {
          lines = lines.substring(1);
        }
        await new Promise((resolve, reject) => fs.close(file, err => err ? reject(err) : resolve(null)));
        if (encoding as any === 'buffer') {
          return Buffer.from(lines, 'binary');
        }
        return Buffer.from(lines, 'binary').toString(encoding);
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


  static async less(filepath: string, from: number = 0, maxlines: number = -1, encoding: BufferEncoding = 'utf8') {
    let stat: Stats = null;
    let file: number = null;
    const NEW_LINE_CHARACTERS = ['\n', '\r'];

    // tslint:disable-next-line:no-shadowed-variable
    const readChar = (stat: Stats, file: number, currentCharacterCount: number) => {
      return new Promise((resolve, reject) => {
        fs.read(file, Buffer.alloc(1), 0, 1, currentCharacterCount, (err: Error, bytesRead: number, buffer: Buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer.toString());
          }
        });
      });
    };

    if (!fs.existsSync(filepath)) {
      throw new Error('file does not exist');
    }

    stat = await new Promise((resolve, reject) => fs.stat(filepath, (err: Error, res: Stats) => err ? reject(err) : resolve(res)));
    file = await new Promise((resolve, reject) => fs.open(filepath, 'r', (err: Error, res: number) => err ? reject(err) : resolve(res)));

    let started = false;
    let chars = 0;
    let lineCount = 0;
    let lineSelectedCount = 0;
    let lines = '';

    // set default lines
    maxlines = maxlines === 0 ? 10000 : maxlines;

    const do_while_loop = async (): Promise<Buffer | string> => {
      if ((!started && lines.length > 0) || chars >= stat.size) {
        await new Promise((resolve, reject) => fs.close(file, err => err ? reject(err) : resolve(null)));
        lines = lines.substring(0, lines.length - 1);
        if (encoding as any === 'buffer') {
          return Buffer.from(lines, 'binary');
        }
        return Buffer.from(lines, 'binary').toString(encoding);
      }

      return readChar(stat, file, chars)
        .then((nextCharacter) => {
          if (lineCount >= from && (lineSelectedCount < maxlines)) {
            started = true;
          } else {
            started = false;
          }
          if (_.includes(NEW_LINE_CHARACTERS, nextCharacter)) {
            lineCount++;
            if (started) {
              lineSelectedCount++;
            }
          }
          if (started) {
            lines = lines + nextCharacter;
          }
          chars++;
        })
        .then(do_while_loop);
    };

    return do_while_loop();
  }


  // todo move this to @allgemein/base
  static async walk(root: any, fn: (x: WalkValues) => void) {
    async function walk(obj: any, parent: any = null, key: string | number = null, location: any[] = []) {
      if (obj === null || obj === undefined) {
        return;
      }
      if (_.isArray(obj)) {
        for (let j = 0; j < obj.length; j++) {
          const el = obj[j];
          const isLeaf = !_.isArray(el) && !_.isPlainObject(el);
          await fn({
            value: el,
            key: key,
            index: j,
            location: [...location, ...[j]],
            parent: obj,
            isLeaf: isLeaf
          });
          if (!isLeaf) {
            await walk(el, j, el, key ? [...location, ...[key], ...[j]] : [...location, ...[j]]);
          }
        }
      } else if (_.isPlainObject(obj)) {
        for (const _key of _.keys(obj)) {
          const isLeaf = !_.isArray(obj[_key]) && !_.isPlainObject(obj[_key]);
          await fn({
            value: obj[_key],
            key: _key,
            parent: obj,
            index: null,
            location: [...location, ...[_key]],
            isLeaf: isLeaf
          });
          if (!isLeaf) {
            await walk(obj[_key], obj, _key, [...location, ...[_key]]);
          }
        }
      } else {
        await fn({
          value: obj,
          key: key,
          parent: parent,
          index: null,
          location: [...location],
          isLeaf: true
        });
      }
    }

    await walk(root);
  }


  static convertError(responses: any[]) {
    if (_.isArray(responses)) {
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        if (response instanceof Error) {
          responses[i] = {
            error: response.name,
            message: response.message,
            nodeId: response[K_NODE_ID],
            instNr: response[K_INST_ID],
          };
        }
      }
    }
  }

}
