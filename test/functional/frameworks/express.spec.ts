import * as path from 'path';
import * as _ from 'lodash';
import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";

import {inspect} from "util";
import {Express} from "../../../src/libs/frameworks/express/Express";


let express: Express = null;

@suite('functional/frameworks/express')
class ExpressSpec {


  @test
  async 'initialize'() {

    let express = new Express();



  }

}

