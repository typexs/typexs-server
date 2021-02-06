import {suite, test, timeout} from '@testdeck/mocha';
import {expect} from 'chai';
import {IFileConfigOptions, PlatformUtils} from '@typexs/base';
import {C_SERVER} from '../../../src/libs/Constants';
import {ServerUtils} from '../../../src/libs/server/ServerUtils';
import {WebServerUtils} from '../../../src/libs/web/WebServerUtils';
import {Config} from '@allgemein/config';

@suite('functional/config/general')
class GeneralSpec {

  before() {
    Config.clear();
  }

  after() {
    Config.clear();
  }


  @test
  async 'server type check fail'() {
    Config.options({
      configs: [<IFileConfigOptions>{
        type: 'file',
        file: PlatformUtils.join(__dirname, 'variants', 'typexs_no_type.yml')
      }]
    });
    const data = Config.get(C_SERVER);
    expect(data.default).to.deep.eq({host: '127.0.0.1', port: 3554});
    expect(ServerUtils.checkIfTypeIsSet(data.default)).to.be.false;
  }


  @test
  async 'server type check pass'() {
    Config.options({
      configs: [<IFileConfigOptions>{
        type: 'file',
        file: PlatformUtils.join(__dirname, 'variants', 'typexs_no_framework.yml')
      }]
    });
    const data = Config.get(C_SERVER);
    expect(data.default).to.deep.include({type: 'web'});
    expect(ServerUtils.checkIfTypeIsSet(data.default)).to.be.true;
  }


  @test
  async 'web server framework check fail'() {
    Config.options({
      configs: [<IFileConfigOptions>{
        type: 'file',
        file: PlatformUtils.join(__dirname, 'variants', 'typexs_no_framework.yml')

      }]
    });
    const data = Config.get(C_SERVER);
    expect(data.default).to.deep.include({type: 'web'});
    expect(WebServerUtils.checkIfFrameworkIsSet(data.default)).to.be.false;
  }


  @test
  async 'web server framework check pass'() {
    Config.options({
      configs: [<IFileConfigOptions>{
        type: 'file',
        file: PlatformUtils.join(__dirname, 'variants', 'typexs_web_routes.yml')

      }]
    });
    const data = Config.get(C_SERVER);
    expect(data.default).to.deep.include({type: 'web', framework: 'express'});
    expect(WebServerUtils.checkIfFrameworkIsSet(data.default)).to.be.true;
  }
}

