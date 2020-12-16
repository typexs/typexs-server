// import * as got from 'got';
import {suite, test, timeout} from '@testdeck/mocha';

import {expect} from 'chai';
import {Injector, Log} from '@typexs/base';
import {Server} from '../../../src/libs/server/Server';
import {HttpFactory, IHttp} from '@allgemein/http';


let server: Server = null;

let http: IHttp;

@suite('functional/server/server')
class RegistrySpec {

  static before() {
    http = HttpFactory.create();
  }


  async before() {
    server = new Server();
  }


  async after() {
    if (server) {
      if (server.hasServer()) {
        await server.shutdown();
      }
    }
  }


  @test
  async 'timeout check '() {
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http', timeout: 100});
    await server.start();
    server.stall = 1000;
    const _url = server.url();
    let err = null;
    try {
      const req = await http.get(_url);
    } catch (err2) {
      err = err2;
      Log.error(err);
    }
    expect(err.message).to.match(new RegExp('socket hang up'));
  }


  /**
   * Server abort scenarios
   */
  /**
   * Test serversite request abort
   */
  @test
  async 'server abort'() {
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http'});
    await server.start();
    server.stall = 1000;
    setTimeout(() => {
      server.shutdown();
    }, 100);
    const _url = server.url();
    try {
      const req = await http.get(_url);
    } catch (err) {
      expect(err.message).to.match(new RegExp('ECONNREFUSED 127.0.0.1:8000'));
    }
  }


  /**
   * Test simple request to the server
   */
  @test
  async 'http server simple request'() {
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http'});
    await server.start();
    const _url = server.url();
    const req = await http.get(_url);
    expect(req.statusCode).to.be.eq(200);
  }

  /**
   * Test Socket timeout exception handling, should be written in the log
   */
  @test
  async 'http server socket timeout request'() {
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http'});
    await server.start();
    try {
      server.stall = 500;
      const req = await http.get(server.url(), {timeout: 100});
      server.stall = 0;
    } catch (err) {
      expect(err.name).to.be.equal('TimeoutError');
      expect(err.message).to.be.equal('Timeout awaiting \'request\' for 100ms');
    }
  }


  /**
   * Test server socket timeout exception handling
   *
   * TODO!!!
   */
  @test
  async 'https server socket timeout request encrypted request'() {
    server.initialize({
      ip: 'proxy.local', port: 8000, protocol: 'https',
      key_file: __dirname + '/files/server-key.pem',
      cert_file: __dirname + '/files/server-cert.pem',
    });
    await server.start();
    const options = {ca: server._options.cert, timeout: 100};
    try {
      server.stall = 500;
      const req = await http.get(server.url() + '/judge/DUMMY', options);
      server.stall = 0;
    } catch (err) {
      expect(err.name).to.be.equal('TimeoutError');
      expect(err.message).to.be.equal('Timeout awaiting \'request\' for 100ms');
    }
  }

  /**
   * Test when server is not reachable or doesn't exists
   */
  @test
  async 'server not reachable - http request'() {
    try {
      const req = await http.get('http://127.0.0.1:12345', {timeout: 100});
    } catch (err) {
      expect(err.message).to.match(new RegExp('connect ECONNREFUSED 127.0.0.1:12345'));
    }
  }


  /**
   * Test when server is not reachable or doesn't exists
   */
  @test
  async 'server not reachable - https request'() {
    const req = http.get('https://127.0.0.1:12345', {timeout: 100});
    try {
      await req;
    } catch (err) {
      expect(err.message).to.match(new RegExp('connect ECONNREFUSED 127.0.0.1:12345'));
    }
  }

}
