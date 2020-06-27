import {suite, test} from 'mocha-typescript';
import {Bootstrap, Injector, RuntimeLoader} from '@typexs/base';
import {WebServer} from '../../../src/libs/web/WebServer';
import {C_DEFAULT} from '../../../src/libs/Constants';
import * as request from 'supertest';
import {expect} from 'chai';
import {IWebServerInstanceOptions, K_ROUTE_CONTROLLER} from '../../../src';
import * as _ from 'lodash';
import {CryptUtils} from 'commons-base';

process.setMaxListeners(1000);
Bootstrap._().activateErrorHandling();
@suite('functional/controllers/body_parser_settings')
class BodyParserSettingsSpec {


  before() {

    // (global as any).routingControllersMetadataArgsStorage = null;
    Injector.reset();

  }

  after() {
    Injector.reset();

  }

  @test
  async 'check body parser limit'() {
    const loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app_consumer',
      libs: [{
        'topic': 'server.controllers',
        'refs': [
          'controllers',
        ]
      }]
    });

    await loader.prepare();
    Injector.set('RuntimeLoader', loader);

    const creds: string[][] = [];
    const web = Injector.get(WebServer);
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
    const uri = web.getUri();
    const routes = web.getRoutes();
    expect(routes).to.have.length(1);
    const started = await web.start();

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
    const length = JSON.stringify(data).length;

    // Payload okay
    res = await request(uri)
      .post('/save').send(data)
      .expect(200);


    const afterlength = JSON.stringify(res.body).length;
    expect(length).to.eq(afterlength);


    const stopped = await web.stop();
    expect(stopped).to.be.true;

  }

  @test
  async 'check body parser default limit'() {
    const loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app_consumer',
      libs: [{
        'topic': 'server.controllers',
        'refs': [
          'controllers',
        ]
      }]
    });

    await loader.prepare();
    Injector.set('RuntimeLoader', loader);

    const creds: string[][] = [];
    const web = Injector.get(WebServer);
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
    const uri = web.getUri();
    const routes = web.getRoutes();
    expect(routes).to.have.length(1);
    const started = await web.start();
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


    const afterlength = JSON.stringify(res.body).length;
    expect(length).to.eq(afterlength);


    const stopped = await web.stop();
    expect(stopped).to.be.true;

  }

}

