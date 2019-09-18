import {suite, test} from 'mocha-typescript';
import {Bootstrap, Config, Container, Injector, RuntimeLoader} from '@typexs/base';
import {WebServer} from '../../../src/libs/web/WebServer';
import {C_DEFAULT, K_ROUTE_CONTROLLER} from '../../../src/libs/Constants';
import {IRoutingController} from '../../../src';
import {expect} from 'chai';
import {MetaArgs} from 'commons-base/browser';
process.setMaxListeners(1000);
Bootstrap._().activateErrorHandling();

@suite('functional/controllers/access')
class WebserverSpec {


  before() {
    // (global as any).routingControllersMetadataArgsStorage = null;
    Container.reset();
    Config.clear();
  }

  after() {
    Container.reset();
    Config.clear();

  }

  @test
  async 'load only selected controller'() {
    const loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app',
      libs: [{
        'topic': 'server.controllers',
        'refs': [
          'controllers',
        ]
      }]
    });

    await loader.prepare();
    Container.set(RuntimeLoader.NAME, loader);

    const web = Injector.get(WebServer) as WebServer;
    await web.initialize({
      type: 'web',
      framework: 'express',
      routes: [<IRoutingController>{
        type: K_ROUTE_CONTROLLER,
        context: C_DEFAULT,
        access: [{
          name: 'JsonDataDeliveryFourth',
          access: 'deny'
        }]
      }]
    });

    await web.prepare();
    // const uri = web.getUri();
    const routes = web.getRoutes();
    expect(routes).to.have.length(1);
    expect(routes.shift().controller).to.eq('JsonDataDeliveryThird');

  }


  @test
  async 'load all controller but ignore one'() {
    const loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app',
      libs: [{
        'topic': 'server.controllers',
        'refs': [
          'controllers',
        ]
      }]
    });

    await loader.prepare();
    Container.set('RuntimeLoader', loader);

    const web = Container.get(WebServer);
    await web.initialize({
      type: 'web',
      framework: 'express',
      routes: [<IRoutingController>{
        type: K_ROUTE_CONTROLLER,
        context: C_DEFAULT,
        access: [{
          name: '*',
          access: 'deny'
        }, {
          name: 'JsonDataDeliveryT*',
          access: 'allow'
        }]
      }]
    });

    await web.prepare();
    const uri = web.getUri();
    const routes = web.getRoutes();
    expect(routes).to.have.length(1);
    expect(routes.map(x => x.controller)).to.deep.eq(['JsonDataDeliveryThird']);

  }

}

