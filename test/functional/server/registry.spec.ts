import {suite, test} from "mocha-typescript";
import {ServerRegistry} from "../../../src/libs/server/ServerRegistry";

import {expect} from "chai";
import {Container, RuntimeLoader} from "@typexs/base";
import {IWebServerInstanceOptions} from "../../../src/libs/web/IWebServerInstanceOptions";

@suite('functional/server/registry')
class RegistrySpec {


  before() {
    Container.reset();
  }

  after() {
    Container.reset();
  }


  @test
  async 'error creating of web server because of framework missing'() {
    let loader = new RuntimeLoader({});
    Container.set("RuntimeLoader", loader);

    let registry = new ServerRegistry();
    try {
      let instance = await registry.create('default', {type: 'web'});
      expect(false).to.be.true;
    } catch (err) {
      expect(err.message).to.eq('framework not present!');
    }
  }


  @test
  async 'create a express web server'() {
    let loader = new RuntimeLoader({});
    Container.set("RuntimeLoader", loader);

    let registry = new ServerRegistry();
    let instance = await registry.create('default', <IWebServerInstanceOptions>{type: 'web', framework: 'express'});

    let opts = instance.options();

    expect(opts).to.deep.include({
      type: 'web',
      framework: 'express',
      routes: [],
      protocol: 'http',
      ip: '127.0.0.1',
      port: 3554,
      fn: 'root',
      stall: 0,
      timeout: 60000,
      _debug: false
    });

  }
}
