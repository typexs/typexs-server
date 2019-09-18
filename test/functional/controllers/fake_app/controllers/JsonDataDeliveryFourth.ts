import {Get, JsonController} from 'routing-controllers';


@JsonController()
export class JsonDataDeliveryFourth {

  @Get('/get4')
  get4() {
    return {json: 'test'};
  }

}


