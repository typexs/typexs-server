import {suite, test} from '@testdeck/mocha';

import {expect} from 'chai';
import {Injector, PlatformUtils, RuntimeLoader} from '@typexs/base';
import {IServer} from '../../../src/libs/server/IServer';
import {IServerInstanceOptions} from '../../../src/libs/server/IServerInstanceOptions';
import {ServerFactory} from '../../../src/libs/server/ServerFactory';
import {WebServer} from '../../../src/libs/web/WebServer';
import {ServerTmpl} from './classes/ServerTmpl';
import {IRoute} from '../../../src/libs/server/IRoute';

@suite('functional/server/factory')
class FactorySpec {


  before() {
    Injector.reset();
  }

  after() {
    Injector.reset();
  }

  @test
  async 'get web server'() {
    const loader = new RuntimeLoader({});
    Injector.set(RuntimeLoader, loader);
    Injector.set('RuntimeLoader', loader);
    const r = new ServerFactory();
    const web = r.get('web');
    expect(web instanceof WebServer).to.be.true;
  }

  @test
  async 'get custom server class'() {
    const r = new ServerFactory();

    class ServerTmplX implements IServer {
      name: string = 'x';

      initialize(options: IServerInstanceOptions) {
      }

      options(): IServerInstanceOptions {
        return <IServerInstanceOptions>{};
      }

      prepare() {
      }

      async start() {
        return true;
      }

      async stop() {
        return true;
      }

      getRoutes(): IRoute[] {
        return [];
      }

      getUri(): string {
        return '';
      }

      hasRoutes(): boolean {
        return false;
      }

    }

    const web = r.get(ServerTmplX);
    expect(web instanceof ServerTmplX).to.be.true;
  }

  @test
  async 'get custom server class from file'() {
    const p = PlatformUtils.join(__dirname, 'classes', 'ServerTmpl');
    const r = new ServerFactory();
    const web = r.get(p);
    expect(web.name).to.eq('x');

  }

  @test
  async 'define new type'() {
    ServerFactory.register('testserver', ServerTmpl);
    const r = new ServerFactory();
    const web = r.get('testserver');
    expect(web.name).to.eq('x');

  }

  @test
  async 'check type'() {

    expect(ServerFactory.checkType('web')).to.be.true;
    expect(ServerFactory.checkType('test')).to.be.false;

    class ServerTmplY implements IServer {
      name: string = 'x';

      initialize(options: IServerInstanceOptions) {
      }

      prepare() {
      }

      options(): IServerInstanceOptions {
        return <IServerInstanceOptions>{};
      }


      async start() {
        return true;
      }

      async stop() {
        return true;
      }

      getRoutes(): IRoute[] {
        return [];
      }

      getUri(): string {
        return '';
      }

      hasRoutes(): boolean {
        return false;
      }

    }

    expect(ServerFactory.checkType(ServerTmplY)).to.be.true;

    class NoServerTmpl {
    }

    expect(ServerFactory.checkType(NoServerTmpl)).to.be.false;
  }

}

