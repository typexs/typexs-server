import {IEntityRefMetadata} from 'commons-schema-api/browser';
import {ICollection} from '@typexs/base/browser';


export interface IStorageRefMetadata {
  name: string;
  framework: string;
  type: string;
  options?: any;
  entities: IEntityRefMetadata[];
  collections?: ICollection[];
}
