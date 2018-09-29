import {suite, test} from "mocha-typescript";
import {ServerRegistry} from "../../../src/libs/server/ServerRegistry";

import {expect} from "chai";
import {PlatformUtils, Container, RuntimeLoader} from "typexs-base";
import {IServer} from "../../../src/libs/server/IServer";
import {IServerInstanceOptions} from "../../../src/libs/server/IServerInstanceOptions";
import {ServerFactory} from "../../../src/libs/server/ServerFactory";
import {WebServer} from "../../../src/libs/web/WebServer";
import * as path from "path";
import * as glob from "glob";
import {IRoute} from "../../../src";

@suite('functional/server/factory')
class FactorySpec {


  before(){
    Container.reset();
  }

  after(){
    Container.reset();
  }

  @test
  async 'get web server'() {
    let loader = new RuntimeLoader({});
    Container.set(RuntimeLoader,loader);
    Container.set("RuntimeLoader",loader);
    let r = new ServerFactory();
    let web = r.get('web');
    expect(web instanceof WebServer).to.be.true;
  }

  @test
  async 'get custom server class'() {
    let r = new ServerFactory();
    class ServerTmplX implements IServer {
      name: string = 'x';

      initialize(options: IServerInstanceOptions) {
      };

      options(): IServerInstanceOptions{return <IServerInstanceOptions>{};}

      prepare() {
      };

      async start() {
        return true;
      };

      async stop(){
        return true;
      };

      getRoutes(): IRoute[] {
        return [];
      }

      getUri(): string {
        return "";
      }

      hasRoutes(): boolean {
        return false;
      }

    }
    let web = r.get(ServerTmplX);
    expect(web instanceof ServerTmplX).to.be.true;
  }

  @test
  async 'get custom server class from file'() {
    let p = PlatformUtils.join(__dirname,'classes','ServerTmpl');
    let r = new ServerFactory();
    let web = r.get(p);
    expect(web.name).to.eq('x');

  }


  @test
  async 'check type'() {

    expect(ServerFactory.checkType('web')).to.be.true;
    expect(ServerFactory.checkType('test')).to.be.false;

    class ServerTmplY implements IServer {
      name: string = 'x';

      initialize(options: IServerInstanceOptions) {
      };

      prepare() {
      };

      options(): IServerInstanceOptions{return <IServerInstanceOptions>{};}


      async start() {
        return true;
      };

      async stop() {
        return true;
      };

      getRoutes(): IRoute[] {
        return [];
      }

      getUri(): string {
        return "";
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

