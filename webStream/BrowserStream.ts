import * as _ from 'lodash';

import IndexedEvents from '../lib/helpers/IndexedEvents';
import MediaServer, {RequestArgs} from './MediaServer';
import Context from '../lib/context/Context';


type ConnectionHandler = (streamPath: string, id: string) => void;


export default class BrowserStream {
  private readonly context: Context;
  private readonly openConnectionEvents = new IndexedEvents<ConnectionHandler>();
  private readonly closeConnectionEvents = new IndexedEvents<ConnectionHandler>();
  // like {'/live/smallRoom': ['QNRY4FDA']}
  private readonly connectedClients: {[index: string]: string[]} = {};
  private mediaServer?: MediaServer;


  constructor(context: Context) {
    this.context = context;
  }

  async start() {
    const mediaServer = new MediaServer(
      this.context.log.logLevel,
      this.context.config.rtmp,
      {
        // TODO: set host ??? and other params
        port: this.context.config.browserStreamServer.port,
        allow_origin: '*'
      }
    );

    this.mediaServer = mediaServer;

    mediaServer.onPreConnect(this.handlePreConnect);
    mediaServer.onDoneConnect(this.handleDoneConnect);
    mediaServer.start();
  }

  destroy() {
    if (this.mediaServer) this.mediaServer.destroy();
  }


  /**
   * fs someone connected to streamPath
   */
  hasAnyConnected(streamPath: string): boolean {
    return !_.isEmpty(this.connectedClients[streamPath]);
  }

  onOpenConnection(cb: ConnectionHandler) {
    this.openConnectionEvents.addListener(cb);
  }

  onCloseConnection(cb: ConnectionHandler) {
    this.closeConnectionEvents.addListener(cb);
  }


  private handlePreConnect = (id: string, args: RequestArgs) => {
    if (!args.streamPath) return;
    if (!this.connectedClients[args.streamPath]) this.connectedClients[args.streamPath] = [];

    this.connectedClients[args.streamPath].push(id);

    this.openConnectionEvents.emit(args.streamPath, id);
  }

  private handleDoneConnect = (id: string, args: RequestArgs) => {
    if (!args.streamPath) return;

    // remove this id
    this.connectedClients[args.streamPath] = _.pull(this.connectedClients[args.streamPath], id);

    this.closeConnectionEvents.emit(args.streamPath, id);
  }

}
