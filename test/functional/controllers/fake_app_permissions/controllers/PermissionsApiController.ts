import {Get, JsonController, Post} from 'routing-controllers';
import {ContextGroup} from '../../../../../src/decorators/ContextGroup';
import {Access} from '../../../../../src/decorators/Access';

@ContextGroup('api')
@JsonController()
export class PermissionsApiController {

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
