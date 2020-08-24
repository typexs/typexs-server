import {Get, JsonController, Post} from 'routing-controllers';
import {Access} from '../../../../../src/decorators/Access';


@JsonController()
export class PermissionsController {

  @Access('allow get')
  @Get('/perm/get')
  get() {
    return {json: 'api'};
  }

  @Access('allow get :name')
  @Get('/perm/get/:name')
  getByName() {
    return {json: 'api2'};
  }

  @Get('/perm/get_other/:name')
  @Access('allow get_other :name')
  getByNameOther() {
    return {json: 'api3'};
  }

  @Post('/perm/get_other/:name')
  @Access('allow post :name')
  postByNameOther() {
    return {json: 'api3'};
  }

}
