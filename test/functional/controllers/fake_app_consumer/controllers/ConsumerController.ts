import {Body, Get, JsonController, Post} from "routing-controllers";
import {Access} from "../../../../../src";


@JsonController()
export class ConsumerController {

  @Post('/save')
  post(@Body() body: any) {

    return body;
  }

}
