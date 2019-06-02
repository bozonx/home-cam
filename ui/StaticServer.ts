import * as path from 'path';
import * as http from 'http';
import {Server} from 'http';
import * as serveStatic from 'serve-static';
import * as finalhandler from 'finalhandler';

//const StaticSrv = require('static-server');

import {WWW_ROOT_DIR} from '../lib/helpers/constants';
import {callPromised} from '../lib/helpers/helpers';
import Context from '../lib/context/Context';


export default class StaticServer {
  private readonly context: Context;
  private server?: Server;


  constructor(context: Context) {
    this.context = context;
  }

  async destroy() {
    if (!this.server) return;

    await callPromised(this.server.close);
  }


  async start() {
    const serve = serveStatic(this.makeWebDir(), { 'index': ['standaloneStarter.ts.html', 'standaloneStarter.ts.htm'] });

    this.server = http.createServer((req, res) => {
      serve(req as any, res as any, finalhandler(req, res));
    });

    // await callPromised(
    //   this.server.listen,
    //   this.context.config.staticServer.port,
    //   this.context.config.staticServer.host,
    // );

    // TODO: use promise

    this.server.listen(
      this.context.config.staticServer.port,
      this.context.config.staticServer.host,
    );

    // this.server = new StaticSrv({
    //   rootPath: this.makeWebDir(),
    //   host: this.context.config.staticServer.host,
    //   port: this.context.config.staticServer.port,
    //   cors: '*',
    // });
    //
    // await callPromised(this.server.start);

    this.context.log.info(`Static server listening to "${this.context.config.staticServer.host}:${this.context.config.staticServer.port}"`);
  }

  private makeWebDir(): string {
    return path.join(this.context.config.workDir, WWW_ROOT_DIR);
  }

}
