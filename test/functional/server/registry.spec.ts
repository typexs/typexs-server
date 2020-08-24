import {suite, test, timeout} from '@testdeck/mocha';
import {ServerRegistry} from '../../../src/libs/server/ServerRegistry';

import {expect} from 'chai';
import {Injector, RuntimeLoader} from '@typexs/base';
import {IWebServerInstanceOptions} from '../../../src/libs/web/IWebServerInstanceOptions';

@suite('functional/server/registry')
class RegistrySpec {


  before() {
    Injector.reset();
  }

  after() {
    Injector.reset();
  }


  @test
  async 'error creating of web server because of framework missing'() {
    const loader = new RuntimeLoader({});
    Injector.set('RuntimeLoader', loader);

    const registry = new ServerRegistry();
    try {
      const instance = await registry.create('default', {type: 'web'});
      expect(false).to.be.true;
    } catch (err) {
      expect(err.message).to.eq('framework not present!');
    }
  }


  @test
  async 'create a express web server'() {
    const loader = new RuntimeLoader({});
    Injector.set('RuntimeLoader', loader);

    const registry = new ServerRegistry();
    const instance = await registry.create('default', <IWebServerInstanceOptions>{type: 'web', framework: 'express'});

    const opts = instance.options();

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
