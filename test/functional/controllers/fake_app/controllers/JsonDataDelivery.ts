import {Get, JsonController} from "routing-controllers";
import {ContextGroup} from "../../../../../src/decorators/ContextGroup";

@ContextGroup('api')
@JsonController()
export class JsonDataDelivery {

  @Get('/get')
  get() {
    return {json: 'api'}
  }

}
