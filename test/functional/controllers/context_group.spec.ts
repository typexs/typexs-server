import {suite, test, timeout} from '@testdeck/mocha';
import {ClassLoader, MetaArgs} from '@typexs/base';
import {expect} from 'chai';
import * as _ from 'lodash';
import {K_META_CONTEXT_ARGS} from '../../../src/libs/Constants';
import {Helper} from '../../../src/libs/Helper';


@suite('functional/controllers/context_group')
class ContextGroupSpec {


  @test
  async 'grouping'() {
    const classes = ClassLoader.importClassesFromDirectories([__dirname + '/fake_app/controllers/*']);
    expect(classes).to.have.length(4);

    const grouped = MetaArgs.key(K_META_CONTEXT_ARGS);
    expect(grouped).to.have.length(2);
    const groups = Helper.resolveGroups(classes);
    expect(_.keys(groups)).to.deep.eq(['api', 'default', 'api2']);
    for (const k of _.keys(groups)) {
      if (k === 'default') {
        expect(groups[k]).to.have.length(2);
      } else {
        expect(groups[k]).to.have.length(1);
      }

    }


  }

}

