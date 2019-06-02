const NodeMediaServer = require('node-media-server');

import LogLevel from '../lib/interfaces/LogLevel';
import IndexedEventEmitter from '../lib/helpers/IndexedEventEmitter';


export interface RequestArgs {
  ip: string;
  method: string;
  streamPath: string;
  query: {[index: string]: any},
}

type MediaServerEventNames = 'preConnect' | 'doneConnect';
type HandlerWithoutStreamPath = (id: string, args: RequestArgs) => void;


/**
 *
 * Urls:
 * * /api/server - server stats
 * * /api/streams - streams stats
 */
export default class MediaServer {
  private readonly events = new IndexedEventEmitter<HandlerWithoutStreamPath>();
  private readonly logLevel: LogLevel;
  private readonly rtmpConfig: {[index: string]: any};
  private readonly httpConfig: {[index: string]: any};
  private nms: any;


  constructor(
    logLevel: LogLevel,
    rtmpConfig: {[index: string]: any},
    httpConfig: {[index: string]: any}
  ) {
    this.logLevel = logLevel;
    this.rtmpConfig = rtmpConfig;
    this.httpConfig = httpConfig;
  }

  start() {
    const preConnectEventName: MediaServerEventNames = 'preConnect';
    const doneConnectEventName: MediaServerEventNames = 'doneConnect';
    const config = {
      logType: this.resolveLogLevel(),
      rtmp: this.rtmpConfig,
      http: this.httpConfig,
      // auth: {
      //   play: true,
      //   publish: true,
      //   secret: 'nodemedia2017privatekey'
      //   api : true,
      //   api_user: 'admin',
      //   api_pass: 'nms2018',
      // }
      // https: {
      //   port: 8443,
      //   key:'./privatekey.pem',
      //   cert:'./certificate.pem',
      // }
      // trans: {
      //   ffmpeg: '/usr/local/bin/ffmpeg',
      //   tasks: [
      //     {
      //       app: 'live',
      //       hls: true,
      //       hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      //       dash: true,
      //       dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      //     }
      //   ]
      // }
    };

    this.nms = new NodeMediaServer(config);
    this.nms.on(preConnectEventName, (...args: any[]) => this.events.emit(preConnectEventName, ...args));
    this.nms.on(doneConnectEventName, (...args: any[]) => this.events.emit(doneConnectEventName, ...args));
    this.nms.run();
  }

  destroy() {
    this.nms.stop();
    delete this.nms;
  }


  onPreConnect(cb: HandlerWithoutStreamPath) {
    const eventName: MediaServerEventNames = 'preConnect';

    this.events.addListener(eventName, cb);
  }

  onDoneConnect(cb: HandlerWithoutStreamPath) {
    const eventName: MediaServerEventNames = 'doneConnect';

    this.events.addListener(eventName, cb);
  }


  private resolveLogLevel(): number {
    switch (this.logLevel) {
      case 'debug':
        return 3;
      case 'info':
        // Log errors and generic info
        return 2;
      case 'warn':
        // Log errors and generic info
        return 2;
      case 'error':
        return 1;
      default:
        // Don't log anything
        return 0;
    }
  }

}


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
