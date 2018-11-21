import {suite, test} from "mocha-typescript";
import {Bootstrap, Container, RuntimeLoader} from "@typexs/base";
import {WebServer} from "../../../src/libs/web/WebServer";
import {C_DEFAULT, K_ROUTE_CONTROLLER, K_ROUTE_STATIC} from "../../../src/types";
import * as request from 'supertest';
import {expect} from "chai";
import {IStaticFiles} from "../../../src/libs/web/IStaticFiles";

@suite('functional/controllers/webserver')
class WebserverSpec {


  before() {
    Bootstrap._().activateErrorHandling();
    //(global as any).routingControllersMetadataArgsStorage = null;
    Container.reset();

  }

  after() {
    Container.reset();

  }

  @test
  async 'load default controllers routes'() {
    let loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app',
      libs: [{
        "topic": "server.controllers",
        "refs": [
          "controllers",
        ]
      }]
    });

    await loader.prepare();
    Container.set("RuntimeLoader", loader);

    let web = Container.get(WebServer);
    await web.initialize({
      type: 'web', framework: 'express', routes: [{
        type: K_ROUTE_CONTROLLER,
        context: C_DEFAULT
      }]
    });

    await web.prepare();
    let uri = web.getUri();
    let routes = web.getRoutes();

    let started = await web.start();


    expect(started).to.be.true;
    let res = await request(uri).get('/get')
      .expect(200);
    let stopped = await web.stop();
    expect(stopped).to.be.true;
    expect(res.body).to.deep.eq({json: 'test'});
    expect(routes).to.deep.eq([
      {
        "authorized": false,
        "context": "default",
        "controller": "JsonDataDelivery",
        "controllerMethod": "get",
        "permissions": null,
        "method": "get",
        "params": [],
        "route": "/get"
      }
    ]);

  }

  @test
  async 'load static routing'() {

    let loader = new RuntimeLoader({});

    await loader.prepare();
    Container.set("RuntimeLoader", loader);

    let web = Container.get(WebServer);
    await web.initialize({
      type: 'web', framework: 'express', routes: [<IStaticFiles>{
        type: K_ROUTE_STATIC,
        path: __dirname + '/fake_app/public'
      }]
    });

    await web.prepare();
    let uri = web.getUri();
    let routes = web.getRoutes();

    let started = await web.start();

    let res = await request(uri).get('/index.html')
      .expect(200);
    let stopped = await web.stop();

    expect(started).to.be.true;
    expect(stopped).to.be.true;
    expect(res.text).to.eq('<html>\n<body>TEST</body>\n</html>\n');
    expect(res.type).to.eq('text/html');
    expect(routes).to.deep.eq([]);

  }


  @test
  async 'load multiple controllers routes'() {
    let loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app',
      libs: [{
        "topic": "server.controllers",
        "refs": [
          "controllers",
        ]
      }]
    });

    await loader.prepare();
    Container.set("RuntimeLoader", loader);

    let web = Container.get(WebServer);
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
    let uri = web.getUri();
    let routes = web.getRoutes();

    let started = await web.start();

    let [res1, res2] = await Promise.all([
      request(uri).get('/get').expect(200)
      ,
      request(uri).get('/api/get').expect(200)
    ])


    //let res1 = await request(uri).get('/get').expect(200);
    //let res2 = await request(uri).get('/api/get').expect(200);
    let stopped = await web.stop();

    expect(started).to.be.true;
    expect(stopped).to.be.true;
    expect(res1.body).to.deep.eq({json: 'test'});
    expect(res2.body).to.deep.eq({json: 'api'});
    expect(routes).to.deep.eq(
      [
        {
          "authorized": false,
          "context": "default",
          "controller": "JsonDataDelivery",
          "controllerMethod": "get",
          "permissions": null,
          "method": "get",
          "params": [],
          "route": "/get",
        },
        {
          "authorized": false,
          "context": "api",
          "method": "get",
          "params": null,
          "route": "/api/get"
        }
      ]);

  }

}

