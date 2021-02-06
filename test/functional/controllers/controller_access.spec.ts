import {suite, test} from '@testdeck/mocha';
import {Bootstrap, Config, Injector, RuntimeLoader} from '@typexs/base';
import {WebServer} from '../../../src/libs/web/WebServer';
import {C_DEFAULT, K_ROUTE_CONTROLLER} from '../../../src/libs/Constants';
import {expect} from 'chai';
import {IRoutingController} from '../../../src/libs/web/IRoutingController';


@suite('functional/controllers/access')
class WebserverSpec {

  static before() {
    process.setMaxListeners(1000);
    Bootstrap.reset();
    Bootstrap._().activateErrorHandling();
  }


  before() {
    // (global as any).routingControllersMetadataArgsStorage = null;
    Injector.reset();
    Config.clear();
  }

  after() {
    Injector.reset();
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
    Injector.set(RuntimeLoader.NAME, loader);

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
    Injector.set('RuntimeLoader', loader);

    const web = Injector.get(WebServer);
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

