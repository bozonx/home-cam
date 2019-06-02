import * as path from 'path';
import * as http from 'http';
import {IncomingMessage, Server} from 'http';
import * as serveStatic from 'serve-static';
import * as finalhandler from 'finalhandler';

//const StaticSrv = require('static-server');

import Main from '../webStream/Main';
import {WWW_ROOT_DIR} from '../lib/helpers/constants';
import {callPromised} from '../lib/helpers/helpers';


export default class StaticServer {
  private readonly main: Main;
  private server?: Server;


  constructor(main: Main) {
    this.main = main;
  }

  async destroy() {
    if (!this.server) return;

    await callPromised(this.server.close);
  }


  async start() {
    const serve = serveStatic(this.makeWebDir(), { 'index': ['index.html', 'index.htm'] });

    this.server = http.createServer((req, res) => {
      serve(req as any, res as any, finalhandler(req, res));
    });

    // await callPromised(
    //   this.server.listen,
    //   this.main.config.staticServer.port,
    //   this.main.config.staticServer.host,
    // );

    // TODO: use promise

    this.server.listen(
      this.main.config.staticServer.port,
      this.main.config.staticServer.host,
    );

    // this.server = new StaticSrv({
    //   rootPath: this.makeWebDir(),
    //   host: this.main.config.staticServer.host,
    //   port: this.main.config.staticServer.port,
    //   cors: '*',
    // });
    //
    // await callPromised(this.server.start);

    this.main.log.info(`Static server listening to "${this.main.config.staticServer.host}:${this.main.config.staticServer.port}"`);
  }

  private makeWebDir(): string {
    return path.join(this.main.config.workDir, WWW_ROOT_DIR);
  }

}
