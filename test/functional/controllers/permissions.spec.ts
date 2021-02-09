import {suite, test} from '@testdeck/mocha';
import {Bootstrap, Injector, RuntimeLoader} from '@typexs/base';
import {WebServer} from '../../../src/libs/web/WebServer';
import {C_DEFAULT, K_ROUTE_CONTROLLER} from '../../../src/libs/Constants';
import * as request from 'supertest';
import {expect} from 'chai';
import {Action} from 'routing-controllers';
import {RoutePermissionsHelper} from '../../../src/libs/RoutePermissionsHelper';
import {IWebServerInstanceOptions} from '../../../src/libs/web/IWebServerInstanceOptions';

let creds: string[][] = [];
let creds2: string[][] = [];
let web: WebServer;

@suite('functional/controllers/permissions')
class PermissionsSpec {


  async before() {
    creds = [];
    creds2 = [];
    Bootstrap._().activateErrorHandling();
    // (global as any).routingControllersMetadataArgsStorage = null;
    Injector.reset();

    const loader = new RuntimeLoader({
      appdir: __dirname + '/fake_app_permissions',
      libs: [{
        'topic': 'server.controllers',
        'refs': [
          'controllers',
        ]
      }]
    });

    await loader.prepare();
    Injector.set('RuntimeLoader', loader);

    web = Injector.get(WebServer);
    await web.initialize(<IWebServerInstanceOptions>{
      type: 'web',
      framework: 'express',

      routes: [{
        type: K_ROUTE_CONTROLLER,
        context: C_DEFAULT,
        authorizationChecker: (action: Action, roles?: string[]) => {

          creds.push(RoutePermissionsHelper.getPermissionsForAction(action));
          return true;
        }
      }, {
        type: K_ROUTE_CONTROLLER,
        context: 'api',
        routePrefix: 'api',
        authorizationChecker: (action: Action, roles?: string[]) => {
          creds2.push(RoutePermissionsHelper.getPermissionsForAction(action));
          return true;
        }
      }]
    });

    await web.prepare();
    const started = await web.start();

    expect(started).to.be.true;

  }

  async after() {
    if (web) {
      const stopped = await web.stop();
    }
    Injector.reset();

  }

  @test
  async 'check permission annotations'() {
    const uri = web.getUri();
    const routes = web.getRoutes();
    expect(routes).to.have.length(8);

    let res = await request(uri)
      .get('/perm/get')
      .expect(200);

    res = await request(uri)
      .get('/perm/get/testname')
      .expect(200);

    res = await request(uri)
      .get('/perm/get_other/testname')
      .expect(200);

    res = await request(uri)
      .post('/perm/get_other/testname')
      .expect(200);

    res = await request(uri)
      .get('/api/perm/get/testname')
      .expect(200);

    res = await request(uri)
      .get('/api/perm/get_other/testname')
      .expect(200);


    // console.log(creds, creds2);
    expect(creds).to.deep.include.members(
      [
        ['allow get'],
        ['allow get testname'],
        ['allow get_other testname'],
        ['allow post testname']
      ]);
    expect(creds2).to.deep.include.members(
      [
        ['allow get testname'],
        ['allow get_other testname'],
      ]);

  }


  @test
  async 'check multivalue permission annotatigulpons'() {
    const uri = web.getUri();
    const routes = web.getRoutes();
    expect(routes).to.have.length(8);

    let res = await request(uri)
      .get('/perm/get/testname,hallo')
      .expect(200);

    // wildcard
    res = await request(uri)
      .get('/perm/get/*test')
      .expect(200);

    res = await request(uri)
      .get('/perm/get/*')
      .expect(200);

    expect(creds).to.deep.include.members(
      [
        ['allow get testname', 'allow get hallo'],
        ['allow get *test'],
        ['allow get *']
      ]
    );
  }

}

