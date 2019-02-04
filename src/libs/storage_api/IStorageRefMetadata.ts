import {IEntityRefMetadata} from "commons-schema-api/browser";

export interface IStorageRefMetadata {
  name: string,
  type: string,
  synchronize: boolean,
  entities: IEntityRefMetadata[];
}
