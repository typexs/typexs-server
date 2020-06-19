import {suite, test, timeout} from 'mocha-typescript';
import {Bootstrap, Config, Container} from '@typexs/base';
import {API_CTRL_FILESYSTEM_READ, K_ROUTE_CONTROLLER} from '../../../src/libs/Constants';
import {WebServer} from '../../../src';
import * as _ from 'lodash';
import {TestHelper} from '../TestHelper';
import {TEST_STORAGE_OPTIONS} from '../config';
import {IEventBusConfiguration} from 'commons-eventbus';
import {HttpFactory, IHttp} from 'commons-http';
import {expect} from 'chai';

const LOG_EVENT = TestHelper.logEnable(false);

const settingsTemplate: any = {
  storage: {
    default: TEST_STORAGE_OPTIONS
  },

  app: {
    name: 'demo',
    path: __dirname + '/apps/fs_test_app', nodeId: 'fs_server'
  },

  modules: {
    paths: [__dirname + '/../../..']
  },

  logging: {
    enable: LOG_EVENT,
    level: 'debug',
    transports: [{console: {}}],
  },

  server: {
    default: {
      type: 'web',
      framework: 'express',
      host: 'localhost',
      port: 4500,

      routes: [{
        type: K_ROUTE_CONTROLLER,
        context: 'api',
        routePrefix: 'api'
      }]
    }
  },
  eventbus: {
    default: <IEventBusConfiguration>{
      adapter: 'redis', extra: {host: '127.0.0.1', port: 6379}
    }
  },
  workers: {
    access: [
      {name: 'ExchangeMessageWorker', access: 'allow'}
    ]
  },

  filesystem: {
    paths: [
      './myfiles'
    ]
  }

};

let bootstrap: Bootstrap = null;
let server: WebServer = null;
let http: IHttp = null;

@suite('functional/controllers/file_system_api_controller') @timeout(300000)
class FileSystemApiControllerSpec {


  static async before() {
    const settings = _.clone(settingsTemplate);
    http = HttpFactory.create();

    bootstrap = Bootstrap
      .setConfigSources([{type: 'system'}])
      .configure(settings)
      .activateErrorHandling()
      .activateLogger();

    await bootstrap.prepareRuntime();
    await bootstrap.activateStorage();
    await bootstrap.startup();

    server = Container.get('server.default');
    await server.start();
  }

  static async after() {
    if (server) {
      await server.stop();
    }
    await bootstrap.shutdown();
    Bootstrap.reset();
    Container.reset();
    Config.clear();
  }


  @test
  async 'list files in allowed directory'() {
    const url = server.url();
    let res: any = await http.get(url + '/api' +
      API_CTRL_FILESYSTEM_READ + '?path=myfiles',
      {json: true});
    res = res.body;
    expect(res).to.not.be.null;
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq([
      ['file01.txt', 'file02.csv', 'file03_with_content.txt']
    ]);
  }

  @test
  async 'get text file content'() {
    const url = server.url();
    let res: any = await http.get(url + '/api' +
      API_CTRL_FILESYSTEM_READ + '?path=myfiles/file03_with_content.txt',
      {json: true});
    res = res.body;
    expect(res).to.not.be.null;
    expect(res).to.have.length(1);
    expect(res[0]).to.have.keys(['data', 'type']);
    expect(res[0].type).to.be.eq('Buffer');
    const content = Buffer.from(res[0].data);
    const text = content.toString();
    expect(text).to.contain('Lorem ipsum dolor sit');
    expect(text).to.contain('labore et dolore magna');
  }

  @test
  async 'path not present error'() {
    const url = server.url();
    try {
      const res: any = await http.get(url + '/api' +
        API_CTRL_FILESYSTEM_READ, {json: true});
      expect(true).to.be.false;
    } catch (e) {
      expect(e.body).to.be.deep.eq({
        status: 500,
        context: 'fs.file',
        message: 'path is empty',
        data: []
      });
    }

  }


}
