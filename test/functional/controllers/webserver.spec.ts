import {suite, test} from "mocha-typescript";
import {RuntimeLoader, Container, MetaArgs} from "typexs-base";
import {WebServer} from "../../../src/libs/web/WebServer";
import {C_DEFAULT, K_ROUTE_CONTROLLER, K_ROUTE_STATIC} from "../../../src/types";
import * as request from 'supertest-as-promised';
import {expect} from "chai";
import {IStaticFiles} from "../../../src/libs/web/IStaticFiles";

@suite('functional/controllers/webserver')
class WebserverSpec {



  before() {
    Container.reset();
    MetaArgs.clear();
  }

  after() {
    Container.reset();
    MetaArgs.clear();
  }

  @test
  async 'load default controllers'() {
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
    Container.set(RuntimeLoader, loader);

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
        "context": "default",
        "route": "/get",
        "type": "get"
      }
    ]);

  }

  @test
  async 'load static'() {

    let loader = new RuntimeLoader({});

    await loader.prepare();
    Container.set(RuntimeLoader, loader);

    let web = Container.get(WebServer);
    await web.initialize({
      type: 'web', framework: 'express', routes: [<IStaticFiles>{
        type: K_ROUTE_STATIC,
        path:__dirname+'/fake_app/public'
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

}

