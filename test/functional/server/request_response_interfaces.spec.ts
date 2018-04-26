import {suite, test} from "mocha-typescript";
import {ServerRegistry} from "../../../src/libs/server/ServerRegistry";

import {expect} from "chai";
import {PlatformUtils, Container, RuntimeLoader} from "typexs-base";
import {IServer} from "../../../src/libs/server/IServer";
import {IServerInstanceOptions} from "../../../src/libs/server/IServerInstanceOptions";
import {ServerFactory} from "../../../src/libs/server/ServerFactory";
import {WebServer} from "../../../src/libs/web/WebServer";
import * as path from "path";
import * as glob from "glob";
import {IWebServerInstanceOptions} from "../../../src/libs/web/IWebServerInstanceOptions";
import {IRequest, IResponse} from "../../../src";

@suite('functional/server/request_response_interfaces')
class RegistrySpec {


  before() {
    Container.reset();
  }

  after() {
    Container.reset();
  }


  @test
  async 'request check '() {

    let req:IRequest = null;
    // TODO
  }

  @test
  async 'response check '() {

    let res:IResponse = null;
    // TODO
  }

}
