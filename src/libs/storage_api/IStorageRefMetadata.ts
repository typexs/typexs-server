import {ICollection} from '@typexs/base';
import {IJsonSchema7} from '@allgemein/schema-api';


export interface IStorageRefMetadata {
  name: string;
  framework: string;
  type: string;
  options?: any;
  schema: IJsonSchema7;
  collections?: ICollection[];
}
