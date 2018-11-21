import {Get, JsonController, Post} from "routing-controllers";
import {Access} from "../../../../../src";


@JsonController()
export class PermissionsController {

  @Access('allow get')
  @Get('/get')
  get() {
    return {json: 'api'}
  }

  @Access('allow get :name')
  @Get('/get/:name')
  getByName() {
    return {json: 'api2'}
  }

  @Get('/get_other/:name')
  @Access('allow get_other :name')
  getByNameOther() {
    return {json: 'api3'}
  }

  @Post('/get_other/:name')
  @Access('allow post :name')
  postByNameOther() {
    return {json: 'api3'}
  }

}
