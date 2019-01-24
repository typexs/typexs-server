import {suite, test} from "mocha-typescript";
import {Bootstrap, Container, CryptUtils, RuntimeLoader} from "@typexs/base";
import {WebServer} from "../../../src/libs/web/WebServer";
import {C_DEFAULT} from "../../../src/libs/Constants";
import * as request from 'supertest';
import {expect} from "chai";
import {IWebServerInstanceOptions, K_ROUTE_CONTROLLER} from "../../../src";
import * as _ from "lodash";

process.setMaxListeners(1000);
Bootstrap._().activateErrorHandling();
@suite('functional/controllers/body_parser_settings')
class Body_parser_settingsSpec {


  before() {

    //(global as any).routingControllersMetadataArgsStorage = null;
    Container.reset();

  }

  after() {
    Container.reset();

  }

  @test
  async 'check body parser limit'() {
    let loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app_consumer',
      libs: [{
        "topic": "server.controllers",
        "refs": [
          "controllers",
        ]
      }]
    });

    await loader.prepare();
    Container.set("RuntimeLoader", loader);

    let creds: string[][] = [];
    let web = Container.get(WebServer);
    await web.initialize(<IWebServerInstanceOptions>{
      type: 'web',
      framework: 'express',

      routes: [{
        type: K_ROUTE_CONTROLLER,
        context: C_DEFAULT,
        // limit to 1024 byte
        limit: 1024
      }]
    });

    await web.prepare();
    let uri = web.getUri();
    let routes = web.getRoutes();
    expect(routes).to.have.length(1);
    let started = await web.start();

    let data: any = {dummy: []};
    _.range(0, 100, 1).map(n => {
      data.dummy.push(CryptUtils.random(32));
    });


    expect(started).to.be.true;
    // Payload to large
    let res = await request(uri)
      .post('/save').send(data)
      .expect(413);


    data = {dummy: []};
    _.range(0, 10, 1).map(n => {
      data.dummy.push(CryptUtils.random(32));
    });
    let length = JSON.stringify(data).length;

    // Payload okay
    res = await request(uri)
      .post('/save').send(data)
      .expect(200);


    let afterlength = JSON.stringify(res.body).length;
    expect(length).to.eq(afterlength);


    let stopped = await web.stop();
    expect(stopped).to.be.true;

  }

  @test
  async 'check body parser default limit'() {
    let loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app_consumer',
      libs: [{
        "topic": "server.controllers",
        "refs": [
          "controllers",
        ]
      }]
    });

    await loader.prepare();
    Container.set("RuntimeLoader", loader);

    let creds: string[][] = [];
    let web = Container.get(WebServer);
    await web.initialize(<IWebServerInstanceOptions>{
      type: 'web',
      framework: 'express',

      routes: [{
        type: K_ROUTE_CONTROLLER,
        context: C_DEFAULT,
        // limit should be set to 10mb
      }]
    });

    await web.prepare();
    let uri = web.getUri();
    let routes = web.getRoutes();
    expect(routes).to.have.length(1);
    let started = await web.start();
    expect(started).to.be.true;

    let data: any = {dummy: []};
    _.range(0, 400000, 1).map(n => {
      data.dummy.push(CryptUtils.random(32));
    });

    let length = JSON.stringify(data).length;
    expect(length / 1024 / 1024).to.be.greaterThan(10);

    // Payload to large
    let res = await request(uri)
      .post('/save').send(data)
      .expect(413);


    data = {dummy: []};
    _.range(0, 100000, 1).map(n => {
      data.dummy.push(CryptUtils.random(32));
    });
    length = JSON.stringify(data).length;

    // Payload okay
    res = await request(uri)
      .post('/save').send(data)
      .expect(200);


    let afterlength = JSON.stringify(res.body).length;
    expect(length).to.eq(afterlength);


    let stopped = await web.stop();
    expect(stopped).to.be.true;

  }

}

