import {JsonController} from 'routing-controllers';
import {ContextGroup} from '../decorators/ContextGroup';
import {API_CTRL_FILESYSTEM, C_API} from '../libs/Constants';
import {FileSystemExchange, Inject} from '@typexs/base';

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


}
