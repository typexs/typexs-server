import {Get, JsonController, Post} from "routing-controllers";
import {Credentials} from "../../../../../src";


@JsonController()
export class CredentialsController {

  @Credentials('allow get')
  @Get('/get')
  get() {
    return {json: 'api'}
  }

  @Credentials('allow get :name')
  @Get('/get/:name')
  getByName() {
    return {json: 'api2'}
  }

  @Get('/get_other/:name')
  @Credentials('allow get_other :name')
  getByNameOther() {
    return {json: 'api3'}
  }

  @Post('/get_other/:name')
  @Credentials('allow post :name')
  postByNameOther() {
    return {json: 'api3'}
  }

}
