import {suite, test} from 'mocha-typescript';
import {Bootstrap, Container, RuntimeLoader, Config} from '@typexs/base';
import {WebServer} from '../../../src/libs/web/WebServer';
import {C_DEFAULT} from '../../../src/libs/Constants';
import * as request from 'supertest';
import {expect} from 'chai';
import {IStaticFiles} from '../../../src/libs/web/IStaticFiles';
import {K_ROUTE_CONTROLLER, K_ROUTE_STATIC} from '../../../src';

process.setMaxListeners(1000);
Bootstrap._().activateErrorHandling();

@suite('functional/controllers/webserver')
class WebserverSpec {


  before() {
    // (global as any).routingControllersMetadataArgsStorage = null;
    Container.reset();

  }

  after() {
    Container.reset();
    Config.clear();

  }

  @test
  async 'load default controllers routes'() {
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
      type: 'web', framework: 'express', routes: [{
        type: K_ROUTE_CONTROLLER,
        context: C_DEFAULT
      }]
    });

    await web.prepare();
    const uri = web.getUri();
    const routes = web.getRoutes();

    const started = await web.start();


    expect(started).to.be.true;
    const res = await request(uri).get('/get')
      .expect(200);
    const stopped = await web.stop();
    expect(stopped).to.be.true;
    expect(res.body).to.deep.eq({json: 'test'});
    expect(routes).to.deep.eq([
      {
        'authorized': false,
        'context': 'default',
        'controller': 'JsonDataDeliveryFourth',
        'controllerMethod': 'get4',
        'permissions': null,
        'method': 'get',
        'params': [],
        'route': '/get4'
      },
      {
        'authorized': false,
        'context': 'default',
        'controller': 'JsonDataDeliveryThird',
        'controllerMethod': 'get',
        'permissions': null,
        'method': 'get',
        'params': [],
        'route': '/get'
      }

    ]);

  }

  @test
  async 'load static routing for absolute path'() {

    const loader = new RuntimeLoader({});

    await loader.prepare();
    Container.set('RuntimeLoader', loader);

    const web = Container.get(WebServer);
    await web.initialize({
      type: 'web', framework: 'express', routes: [<IStaticFiles>{
        type: K_ROUTE_STATIC,
        path: __dirname + '/fake_app/public'
      }]
    });

    await web.prepare();
    const uri = web.getUri();
    const routes = web.getRoutes();

    const started = await web.start();

    const res = await request(uri).get('/index.html')
      .expect(200);
    const stopped = await web.stop();

    expect(started).to.be.true;
    expect(stopped).to.be.true;
    expect(res.text).to.eq('<html>\n<body>TEST</body>\n</html>\n');
    expect(res.type).to.eq('text/html');
    expect(routes).to.deep.eq([{
      'authorized': false,
      'context': 'default',
      'method': 'get',
      'params': null,
      'route': '/',
      'serveStatic': true
    }]);
  }

  @test
  async 'load static routing for relative path'() {
    Config.set('app.path', __dirname + '/fake_app');
    const loader = new RuntimeLoader({});

    await loader.prepare();
    Container.set('RuntimeLoader', loader);

    const web = Container.get(WebServer);
    await web.initialize({
      type: 'web', framework: 'express', routes: [<IStaticFiles>{
        type: K_ROUTE_STATIC,
        path: 'public'
      }]
    });

    await web.prepare();
    const uri = web.getUri();
    const routes = web.getRoutes();

    const started = await web.start();

    const res = await request(uri).get('/index.html')
      .expect(200);
    const stopped = await web.stop();

    expect(started).to.be.true;
    expect(stopped).to.be.true;
    expect(res.text).to.eq('<html>\n<body>TEST</body>\n</html>\n');
    expect(res.type).to.eq('text/html');
    expect(routes).to.deep.eq([{
      'authorized': false,
      'context': 'default',
      'method': 'get',
      'params': null,
      'route': '/',
      'serveStatic': true
    }]);

  }

  @test
  async 'load static routing for relative path with prefix'() {
    Config.set('app.path', __dirname + '/fake_app');
    const loader = new RuntimeLoader({});

    await loader.prepare();
    Container.set('RuntimeLoader', loader);

    const web = Container.get(WebServer);
    await web.initialize({
      type: 'web', framework: 'express', routes: [<IStaticFiles>{
        type: K_ROUTE_STATIC,
        path: 'public',
        routePrefix: 'files'
      }]
    });

    await web.prepare();
    const uri = web.getUri();
    const routes = web.getRoutes();

    const started = await web.start();

    const res = await request(uri).get('/files/index.html')
      .expect(200);
    const stopped = await web.stop();

    expect(started).to.be.true;
    expect(stopped).to.be.true;
    expect(res.text).to.eq('<html>\n<body>TEST</body>\n</html>\n');
    expect(res.type).to.eq('text/html');
    expect(routes).to.deep.eq([
      {
        context: 'default',
        route: '/files',
        method: 'get',
        serveStatic: true,
        params: null,
        authorized: false
      }
    ]);

  }


  @test
  async 'load multiple controllers routes'() {
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
      type: 'web', framework: 'express', routes: [
        {
          type: K_ROUTE_CONTROLLER,
          context: C_DEFAULT
        },
        {
          type: K_ROUTE_CONTROLLER,
          context: 'api',
          routePrefix: '/api'
        }]
    });

    await web.prepare();
    const uri = web.getUri();
    const routes = web.getRoutes();

    const started = await web.start();

    const [res1, res2] = await Promise.all([
      request(uri).get('/get4').expect(200),
      request(uri).get('/apias/get').expect(200)
    ]);

    const stopped = await web.stop();

    expect(started).to.be.true;
    expect(stopped).to.be.true;
    expect(res1.body).to.deep.eq({json: 'test'});
    expect(res2.body).to.deep.eq({json: 'api'});
    expect(routes).to.deep.eq(
      [
        {
          'authorized': false,
          'context': 'default',
          'controller': 'JsonDataDeliveryFourth',
          'controllerMethod': 'get4',
          'permissions': null,
          'method': 'get',
          'params': [],
          'route': '/get4',
        },
        {
          'authorized': false,
          'context': 'default',
          'controller': 'JsonDataDeliveryThird',
          'controllerMethod': 'get',
          'permissions': null,
          'method': 'get',
          'params': [],
          'route': '/get',
        },
        {
          'authorized': false,
          'context': 'api',
          'method': 'get',
          'params': null,
          'route': '/apias/get'
        }
      ]);

  }


  @test
  async 'load controllers and static routes'() {
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
      type: 'web', framework: 'express', routes: [
        {
          type: K_ROUTE_CONTROLLER,
          context: C_DEFAULT
        },
        {
          type: K_ROUTE_STATIC,
          routePrefix: 'files',
          path: __dirname + '/fake_app/public'
        }]
    });

    await web.prepare();
    const uri = web.getUri();
    const routes = web.getRoutes();

    const started = await web.start();

    const [res1, res2] = await Promise.all([
      request(uri).get('/get').expect(200),
      request(uri).get('/files/index.html').expect(200)
    ]);

    const stopped = await web.stop();
    expect(started).to.be.true;
    expect(stopped).to.be.true;
    expect(res1.body).to.deep.eq({json: 'test'});
    expect(res2.text).to.eq('<html>\n<body>TEST</body>\n</html>\n');
    expect(res2.type).to.eq('text/html');
    expect(routes).to.deep.eq(
      [
        {
          context: 'default',
          route: '/get4',
          method: 'get',
          params: [],
          controller: 'JsonDataDeliveryFourth',
          controllerMethod: 'get4',
          permissions: null,
          authorized: false
        },
        {
          context: 'default',
          route: '/get',
          method: 'get',
          params: [],
          controller: 'JsonDataDeliveryThird',
          controllerMethod: 'get',
          permissions: null,
          authorized: false
        },
        {
          context: 'default',
          route: '/files',
          method: 'get',
          serveStatic: true,
          params: null,
          authorized: false
        }
      ]);

  }

}

