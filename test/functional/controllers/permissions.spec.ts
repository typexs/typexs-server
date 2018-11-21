import {suite, test} from "mocha-typescript";
import {Bootstrap, Container, MetaArgs, RuntimeLoader} from "@typexs/base";
import {WebServer} from "../../../src/libs/web/WebServer";
import {C_DEFAULT, K_META_PERMISSIONS_ARGS, K_ROUTE_CONTROLLER, K_ROUTE_STATIC} from "../../../src/types";
import * as request from 'supertest';
import {expect} from "chai";
import {IStaticFiles} from "../../../src/libs/web/IStaticFiles";
import {IWebServerInstanceOptions} from "../../../src";
import {Action, getMetadataArgsStorage} from "routing-controllers";
import * as _ from "lodash";
import {PermissionsHelper} from "../../../src/libs/PermissionsHelper";

@suite('functional/controllers/permissions')
class PermissionsSpec {


  before() {
    Bootstrap._().activateErrorHandling();
    //(global as any).routingControllersMetadataArgsStorage = null;
    Container.reset();

  }

  after() {
    Container.reset();

  }

  @test
  async 'check permission annotations'() {
    let loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app_permissions',
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
        authorizationChecker: (action: Action, roles?: string[]) => {
          creds.push(PermissionsHelper.getRightsForAction(action));
          return true;
        }
      }]
    });

    await web.prepare();
    let uri = web.getUri();
    let routes = web.getRoutes();
    expect(routes).to.have.length(4);
    let started = await web.start();

    expect(started).to.be.true;
    let res = await request(uri)
      .get('/get')
      .expect(200);

    res = await request(uri)
      .get('/get/testname')
      .expect(200);

    res = await request(uri)
      .get('/get_other/testname')
      .expect(200);

    res = await request(uri)
      .post('/get_other/testname')
      .expect(200);

    let stopped = await web.stop();
    expect(stopped).to.be.true;

    expect(creds).to.deep.include.members(
      [
        ['allow get'],
        ['allow get testname'],
        ['allow get_other testname'],
        ['allow post testname']
      ]);

  }

}

