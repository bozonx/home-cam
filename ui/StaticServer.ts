import * as path from 'path';

const StaticSrv = require('static-server');

import Main from '../webStream/Main';
import {WWW_ROOT_DIR} from '../lib/helpers/constants';
import {callPromised} from '../lib/helpers/helpers';


export default class StaticServer {
  private readonly main: Main;
  private server?: typeof StaticSrv;


  constructor(main: Main) {
    this.main = main;
  }

  destroy() {
    if (!this.server) return;

    this.server.stop();
  }


  async start() {
    this.server = new StaticSrv({
      rootPath: this.makeWwwDir(),
      host: this.main.config.staticServer.host,
      port: this.main.config.staticServer.port,
      cors: '*',
    });

    await callPromised(this.server.start);

    this.main.log.info(`Static server listening to "${this.main.config.staticServer.host}:${this.main.config.staticServer.port}"`);
  }

  private makeWwwDir(): string {
    return path.join(this.main.config.workDir, WWW_ROOT_DIR);
  }

}
