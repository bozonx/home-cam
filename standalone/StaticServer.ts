import * as path from 'path';
import * as http from 'http';
import {IncomingMessage, Server, ServerResponse} from 'http';
import * as serveStatic from 'serve-static';
import * as finalhandler from 'finalhandler';

import {WWW_ROOT_DIR} from '../lib/helpers/constants';
import Context from '../lib/context/Context';
import IndexedEvents from '../lib/helpers/IndexedEvents';


type RequestHandler = (request: IncomingMessage, response: ServerResponse) => void;


export default class StaticServer {
  private readonly context: Context;
  private readonly requestEvents = new IndexedEvents<RequestHandler>();
  private server?: Server;


  constructor(context: Context) {
    this.context = context;
  }

  destroy() {
    this.requestEvents.removeAll();

    this.server && this.server.close();
  }


  onRequest(cb: RequestHandler): number {
    return this.requestEvents.addListener(cb);
  }

  async start() {
    const serve = serveStatic(this.makeWebDir(), { 'index': ['index.html', 'index.htm'] });

    this.server = http.createServer((req, res) => {
      serve(req as any, res as any, finalhandler(req, res));
    });

    await new Promise((resolve) => {
      this.server && this.server.listen(
        this.context.config.staticServer.port,
        this.context.config.staticServer.host,
        resolve
      );
    });

    this.server.on('request', (request: IncomingMessage, response: ServerResponse) => {
      this.requestEvents.emit(request, response);
    });

    this.context.log.info(`Static server listening to "${this.context.config.staticServer.host}:${this.context.config.staticServer.port}"`);
  }

  private makeWebDir(): string {
    return path.join(this.context.config.workDir, WWW_ROOT_DIR);
  }

}
