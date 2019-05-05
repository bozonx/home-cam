import IndexedEvents from './helpers/IndexedEvents';

const NodeMediaServer = require('node-media-server');

import Config from './Config';
import * as _ from 'lodash';


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
  private readonly config: Config;


  constructor(config: Config) {
    this.config = config;
  }


  /**
   * fs someone connected to streamPath
   */
  hasAnyConnected(): boolean {
    return !_.isEmpty(this.connectedClients);
  }

  start() {
    const config = {
      // TODO: set via config
      /*
      0 - Don't log anything
      1 - Log errors
      2 - Log errors and generic info
      3 - Log everything (debug)
       */
      logType: 3,
      rtmp: {
        ...this.config.rtmp
      },
      http: {
        // TODO: set host ??? and other params
        port: this.config.browserStreamServer.port,
        allow_origin: '*'
      },

      // auth: {
      //   play: true,
      //   publish: true,
      //   secret: 'nodemedia2017privatekey'
      // }
    };

    var nms = new NodeMediaServer(config);
    nms.run();

    nms.on('preConnect', this.handlePreConnect);
    nms.on('doneConnect', this.handleDoneConnect);

    // nms.on('postConnect', (id: string, args: RequestArgs) => {
    //   console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
    // });

    // nms.on('prePublish', (id: string, StreamPath: string, args: {[index: string]: any}) => {
    //   console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    //   // let session = nms.getSession(id);
    //   // session.reject();
    // });
    //
    // nms.on('postPublish', (id: string, StreamPath: string, args: {[index: string]: any}) => {
    //   console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // });
    //
    // nms.on('donePublish', (id: string, StreamPath: string, args: {[index: string]: any}) => {
    //   console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // });
    //
    // nms.on('prePlay', (id: string, StreamPath: string, args: {[index: string]: any}) => {
    //   console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    //   // let session = nms.getSession(id);
    //   // session.reject();
    // });
    //
    // nms.on('postPlay', (id: string, StreamPath: string, args: {[index: string]: any}) => {
    //   console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // });
    //
    // nms.on('donePlay', (id: string, StreamPath: string, args: {[index: string]: any}) => {
    //   console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    // });
  }

  destroy() {
    // TODO: !!!
  }

  onOpenConnection(cb: ConnectionHandler) {
    this.openConnectionEvents.addListener(cb);
  }

  onCloseConnection(cb: ConnectionHandler) {
    this.closeConnectionEvents.addListener(cb);
  }


  private handlePreConnect(id: string, args: RequestArgs) {
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

  private handleDoneConnect(id: string, args: RequestArgs) {
    // remove this id
    this.connectedClients[args.streamPath] = _.pull(this.connectedClients[args.streamPath], id);

    this.closeConnectionEvents.emit(args.streamPath, id);
  }

}
