import {Get, JsonController, QueryParam} from 'routing-controllers';
import {ContextGroup} from '../decorators/ContextGroup';
import {_API_CTRL_FILESYSTEM_READ, API_CTRL_FILESYSTEM, C_API, PERMISSION_ACCESS_FILES} from '../libs/Constants';
import {FileSystemExchange, Inject} from '@typexs/base';
import {Access} from '../decorators/Access';
import {IFileOptions, IFileSelectOptions} from '@typexs/base/adapters/exchange/filesystem/IFileOptions';
import {HttpResponseError} from '..';
import * as _ from 'lodash';

/**
 * TODO Implements file exchange between client and server (supports distributed mode)
 *
 *
 */
@ContextGroup(C_API)
@JsonController(API_CTRL_FILESYSTEM)
export class FileSystemAPIController {


  @Inject(() => FileSystemExchange)
  fsExchange: FileSystemExchange;


  static checkOptions(opts: any, options: any) {
    if (!_.isEmpty(opts)) {
      const checked = {};
      _.keys(opts).filter(k => [
          'glob',
          'unit',
          'limit',
          'offset',
          'tail',
          'stats',
          'timeout',
          'skipLocal',
          'outputMode',
          'targetIds',
          'filterErrors'
        ].indexOf(k) > -1 &&
        (_.isString(opts[k]) ||
          _.isNumber(opts[k]) ||
          _.isPlainObject(opts[k]) ||
          _.isBoolean(opts[k])))
        .map(k => checked[k] = opts[k]);
      _.assign(options, opts);
    }
  }

  /**
   * TODO works only with exchangemessageworker online
   *
   * @param path
   * @param opts
   */
  @Access([PERMISSION_ACCESS_FILES])
  @Get(_API_CTRL_FILESYSTEM_READ)
  getFile(@QueryParam('path') path: string,
          @QueryParam('opts') opts: IFileSelectOptions = {},
  ) {
    if (!path) {
      throw new HttpResponseError(['fs', 'file'], 'path is empty');
    }
    const options: IFileOptions = {
      path: path
    };
    FileSystemAPIController.checkOptions(opts, options);

    try {
      return this.fsExchange.file(options);
    } catch (e) {
      throw new HttpResponseError(['fs', 'file'], e.message);
    }
  }

}
