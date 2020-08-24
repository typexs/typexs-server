import {suite, test, timeout} from '@testdeck/mocha';

import {expect} from 'chai';
import {Helper} from '../../../src/libs/Helper';


@suite('functional/helper/helper')
class HelperSpec {


  @test
  async 'tail file content'() {
    const filename = __dirname + '/testdata/data_01.log';


    const tailed: string = <string>await Helper.tail(filename, 5);
    expect(tailed.split('\n')).to.have.length(5);
    expect(tailed).to.contain('delenit augue duis dolore te feugait nulla facilisi.');

  }


  @test
  async 'select file content'() {
    const filename = __dirname + '/testdata/data_01.log';

    const firstLine: string = <string>await Helper.less(filename, 0, 1);
    expect(firstLine.split('\n')).to.have.length(1);
    expect(firstLine).to.contain('Lorem ipsum dolor sit amet, consetetur sadipscing elitr,');

    const secondLine: string = <string>await Helper.less(filename, 1, 1);
    expect(secondLine.split('\n')).to.have.length(1);
    expect(secondLine).to.contain('sed diam nonumy eirmod tempor invidunt ut labore et dolore');

    const paragraph: string = <string>await Helper.less(filename, 14, 5);
    expect(paragraph.split('\n')).to.have.length(5);
    expect(paragraph).to.contain(
      'Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit\n' +
      'amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy\n' +
      'eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.\n' +
      'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd\n' +
      'gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem');

    const end: string = <string>await Helper.less(filename, 35, 10);
    expect(end.split('\n')).to.have.length(2);
    expect(end).to.contain(
      'accumsan et iusto odio dignissim qui blandit praesent luptatum zzril\n' +
      'delenit augue duis dolore te feugait nulla facilisi.');


    const end2: string = <string>await Helper.less(filename, 35, 2);
    expect(end2.split('\n')).to.have.length(2);
    expect(end2).to.contain(
      'accumsan et iusto odio dignissim qui blandit praesent luptatum zzril\n' +
      'delenit augue duis dolore te feugait nulla facilisi.');


    const all: string = <string>await Helper.less(filename, 0, 0);
    expect(all.split('\n')).to.have.length(37);

    const allFrom: string = <string>await Helper.less(filename, 10, 0);
    expect(allFrom.split('\n')).to.have.length(27);

  }


}
