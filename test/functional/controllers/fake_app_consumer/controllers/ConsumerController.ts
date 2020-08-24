import {Body, JsonController, Post} from 'routing-controllers';


@JsonController()
export class ConsumerController {

  @Post('/save')
  post(@Body() body: any) {

    return body;
  }

}
