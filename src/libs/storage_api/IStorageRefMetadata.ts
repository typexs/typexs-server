import {IEntityRefMetadata} from "commons-schema-api/browser";
import {ICollection} from "@typexs/base/browser"


export interface IStorageRefMetadata {
  name: string,
  type: string,
  synchronize: boolean,
  options?: any,
  entities: IEntityRefMetadata[];
  collections?: ICollection[];
}
