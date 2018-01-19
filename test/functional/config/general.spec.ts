import {suite, test} from "mocha-typescript";
import {expect} from "chai";
import {Config, IFileConfigOptions, PlatformUtils} from "typexs-base";
import {C_SERVER} from "../../../src/types";



@suite('functional/config/general')
class GeneralSpec {

  before() {
    Config.clear();
  }

  after() {
    Config.clear();
  }

  @test
  async 'server type check'() {
    /*
    Config.options({
      configs: [<IFileConfigOptions>{
        type: 'file',
        file: PlatformUtils.join(__dirname, 'config', 'typexs_no_type.yml')
      }]
    })

    let data = Config.get(C_SERVER);
    console.log(data);
*/
    //let appServer = new AppServer();
  }

}

