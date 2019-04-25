import * as got from 'got';
import {suite, test} from "mocha-typescript";
import {ServerRegistry} from "../../../src/libs/server/ServerRegistry";

import {expect} from "chai";
import {PlatformUtils, Container, RuntimeLoader, Log} from "@typexs/base";
import {IServer} from "../../../src/libs/server/IServer";
import {IServerInstanceOptions} from "../../../src/libs/server/IServerInstanceOptions";
import {ServerFactory} from "../../../src/libs/server/ServerFactory";
import {WebServer} from "../../../src/libs/web/WebServer";
import * as path from "path";
import * as glob from "glob";
import {IWebServerInstanceOptions} from "../../../src/libs/web/IWebServerInstanceOptions";
import {IRequest, IResponse, Server} from "../../../src";


let server:Server = null;
@suite('functional/server/'+__filename)
class RegistrySpec {


  async after(){
    if(server){
      await server.stop();
      await server.shutdown();
    }
  }


  @test
  async 'timeout check '() {
    server = new Server();
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http', timeout: 100});

    await server.start();

    server.stall = 1000;

    let _url = server.url();

    let err = null;
    try {
      let req = await got.get(_url);
    } catch (err2) {
      err = err2;
      Log.error(err)
    }
    expect(err.message).to.match(new RegExp("socket hang up"));


  }



  /**
   * Server abort scenarios
   */
  /**
   * Test serversite request abort
   */
  @test
  async 'server abort'() {
    server = new Server();
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http'});
    await server.start();

    server.stall = 1000;

    setTimeout(() => {
      server.shutdown()
    }, 100);

    let _url = server.url();

    try {
      let req = await got.get(_url);
    } catch (err) {
      expect(err.message).to.match(new RegExp("ECONNREFUSED 127.0.0.1:8000"))
    }

  }



  /**
   * Test simple request to the server
   */
  @test
  async 'http server simple request'() {

    server = new Server();
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http'});

    await server.start();

    let _url = server.url();
    let req = await got.get(_url);

    expect(req.statusCode).to.be.eq(200);


  }

  /**
   * Test Socket timeout exception handling, should be written in the log
   */
  @test
  async 'http server socket timeout request'() {

    server = new Server();
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http'});

    await server.start();

    // this.timeout(server.stall)
    let result = null;
    let rrm = null;
    try {
      server.stall = 500;
      let req = await got.get(server.url(), {timeout: 100});
      server.stall = 0
    } catch (err) {
      expect(err.name).to.be.equal('TimeoutError');
      expect(err.message).to.be.equal('Timeout awaiting \'request\' for 100ms')
    }


  }


  /**
   * Test server socket timeout exception handling
   *
   * TODO!!!
   */
  @test
  async 'https server socket timeout request encrypted request'() {

    server = new Server();
    server.initialize({
      ip: 'proxy.local', port: 8000, protocol: 'https',
      key_file: __dirname + '/files/server-key.pem',
      cert_file: __dirname + '/files/server-cert.pem',
    });

    await server.start();

    let options = {ca: server._options.cert,timeout:100};

    //_request.debug = true
    try{
      server.stall = 500;
      let req = await got.get(server.url() + '/judge/DUMMY', options);
      server.stall = 0
    }catch (err) {
      expect(err.name).to.be.equal('TimeoutError');
      expect(err.message).to.be.equal('Timeout awaiting \'request\' for 100ms')
    }

  }

  /**
   * Test when server is not reachable or doesn't exists
   */
  @test
  async 'server not reachable - http request'() {

    let result = null;
    let rrm = null;
    try {
      let req = await got.get('http://127.0.0.1:12345', {timeout: 100});
    } catch (err) {
      expect(err.message).to.match(new RegExp("connect ECONNREFUSED 127.0.0.1:12345"))
    }
  }


  /**
   * Test when server is not reachable or doesn't exists
   */
  @test
  async 'server not reachable - https request'() {
    let result = null;
    let rrm = null;
    try {
      let req = await got.get('https://127.0.0.1:12345', {timeout: 100});
    } catch (err) {
      expect(err.message).to.match(new RegExp("connect ECONNREFUSED 127.0.0.1:12345"))
    }

  }

}
