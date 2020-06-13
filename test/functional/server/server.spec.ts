import * as got from 'got';
import {suite, test} from 'mocha-typescript';

import {expect} from 'chai';
import {Container, Log} from '@typexs/base';
import {Server} from '../../../src';


let server: Server = null;

@suite('functional/server/server.spec.ts')
class RegistrySpec {


  async after() {
    if (server) {
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

    const _url = server.url();

    let err = null;
    try {
      const req = await got.get(_url);
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
    server = new Server();
    server.initialize({ip: 'localhost', port: 8000, protocol: 'http'});
    await server.start();

    server.stall = 1000;

    setTimeout(() => {
      server.shutdown();
    }, 100);

    const _url = server.url();

    try {
      const req = await got.get(_url);
    } catch (err) {
      expect(err.message).to.match(new RegExp('ECONNREFUSED 127.0.0.1:8000'));
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

    const _url = server.url();
    const req = await got.get(_url);

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
    try {
      server.stall = 500;
      const req = await got.get(server.url(), {timeout: 100});
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

    server = new Server();
    server.initialize({
      ip: 'proxy.local', port: 8000, protocol: 'https',
      key_file: __dirname + '/files/server-key.pem',
      cert_file: __dirname + '/files/server-cert.pem',
    });

    await server.start();

    const options = {ca: server._options.cert, timeout: 100};

    // _request.debug = true
    try {
      server.stall = 500;
      const req = await got.get(server.url() + '/judge/DUMMY', options);
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
      const req = await got.get('http://127.0.0.1:12345', {timeout: 100});
    } catch (err) {
      expect(err.message).to.match(new RegExp('connect ECONNREFUSED 127.0.0.1:12345'));
    }
  }


  /**
   * Test when server is not reachable or doesn't exists
   */
  @test
  async 'server not reachable - https request'() {
    try {
      const req = await got.get('https://127.0.0.1:12345', {timeout: 100});
    } catch (err) {
      expect(err.message).to.match(new RegExp('connect ECONNREFUSED 127.0.0.1:12345'));
    }

  }

}
