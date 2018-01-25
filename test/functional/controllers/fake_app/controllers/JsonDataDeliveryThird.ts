import {Get, JsonController} from "routing-controllers";
import {ContextGroup} from "../../../../../src/decorators/ContextGroup";


@JsonController()
export class JsonDataDeliveryThird {

  @Get('/get')
  get() {
    return {json: 'test'}
  }

}


