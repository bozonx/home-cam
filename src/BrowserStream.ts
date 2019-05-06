import * as _ from 'lodash';

import IndexedEvents from './helpers/IndexedEvents';
import Config from './Config';
import MediaServer from './helpers/MediaServer';
import Main from './Main';


type ConnectionHandler = (streamPath: string, id: string) => void;

interface RequestArgs {
  ip: string;
  method: string;
  streamPath: string;
  query: {[index: string]: any},
}


export default class BrowserStream {
  private readonly openConnectionEvents = new IndexedEvents<ConnectionHandler>();
  private readonly closeConnectionEvents = new IndexedEvents<ConnectionHandler>();
  // like {'/live/smallRoom': ['QNRY4FDA']}
  private readonly connectedClients: {[index: string]: string[]} = {};
  private readonly main: Main;
  private readonly mediaServer: MediaServer;


  constructor(main: Main) {
    this.main = main;
    this.mediaServer = new MediaServer(
      this.main.log.logLevel,
      this.main.config.rtmp,
      {
        // TODO: set host ??? and other params
        port: this.main.config.browserStreamServer.port,
        allow_origin: '*'
      }
    );

    // TODO: add listeners
  }


  /**
   * fs someone connected to streamPath
   */
  hasAnyConnected(streamPath: string): boolean {
    return !_.isEmpty(this.connectedClients[streamPath]);
  }

  async start() {
    this.mediaServer.start();
  }

  destroy() {
    this.mediaServer.destroy();
  }

  onOpenConnection(cb: ConnectionHandler) {
    this.openConnectionEvents.addListener(cb);
  }

  onCloseConnection(cb: ConnectionHandler) {
    this.closeConnectionEvents.addListener(cb);
  }


  private handlePreConnect = (id: string, args: RequestArgs) => {
    //this.connectedClients[]
    // id=212K9N2L args={"ip":"::1","method":"GET","streamPath":"/live/smallRoom","query":{}}
    // TODO: use postConnect
    //console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
    // let session = nms.getSession(id);
    // session.reject();

    if (!args.streamPath) return;

    if (!this.connectedClients[args.streamPath]) this.connectedClients[args.streamPath] = [];

    this.connectedClients[args.streamPath].push(id);

    this.openConnectionEvents.emit(args.streamPath, id);
  }

  private handleDoneConnect = (id: string, args: RequestArgs) => {
    // remove this id
    this.connectedClients[args.streamPath] = _.pull(this.connectedClients[args.streamPath], id);

    this.closeConnectionEvents.emit(args.streamPath, id);
  }

}
