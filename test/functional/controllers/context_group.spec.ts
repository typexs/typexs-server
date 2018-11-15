import * as _ from "lodash";
import {suite, test} from "mocha-typescript";
import {MetaArgs, ClassLoader} from "@typexs/base";
import {expect} from "chai";
import {K_META_CONTEXT_ARGS} from "../../../src/types";
import {Helper} from "../../../src/libs/Helper";


@suite('functional/controllers/context_group')
class Context_groupSpec {

  /*
  before() {
    MetaArgs.clear();
  }

  after() {
    MetaArgs.clear();
  }
  */

  @test
  async 'grouping'() {
    let classes = ClassLoader.importClassesFromDirectories([__dirname + '/fake_app/controllers/*']);
    expect(classes).to.have.length(3);

    let grouped = MetaArgs.key(K_META_CONTEXT_ARGS);
    expect(grouped).to.have.length(2);
    let groups = Helper.resolveGroups(classes);
    expect(Object.keys(groups)).to.deep.eq([ 'api', 'api2', 'default' ]);
    for(let k in groups){
      expect(groups[k]).to.have.length(1);
    }


  }

}

