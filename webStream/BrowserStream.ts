import * as _ from 'lodash';

import IndexedEvents from '../lib/helpers/IndexedEvents';
import MediaServer, {RequestArgs} from '../lib/helpers/MediaServer';
import Main from './Main';


type ConnectionHandler = (streamPath: string, id: string) => void;


export default class BrowserStream {
  private readonly openConnectionEvents = new IndexedEvents<ConnectionHandler>();
  private readonly closeConnectionEvents = new IndexedEvents<ConnectionHandler>();
  // like {'/live/smallRoom': ['QNRY4FDA']}
  private readonly connectedClients: {[index: string]: string[]} = {};
  private readonly main: Main;
  private mediaServer?: MediaServer;


  constructor(main: Main) {
    this.main = main;
  }

  async start() {
    const mediaServer = new MediaServer(
      this.main.log.logLevel,
      this.main.config.rtmp,
      {
        // TODO: set host ??? and other params
        port: this.main.config.browserStreamServer.port,
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
