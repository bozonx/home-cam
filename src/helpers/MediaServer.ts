import LogLevel from '../interfaces/LogLevel';

const NodeMediaServer = require('node-media-server');


export default class MediaServer {
  private readonly logLevel: LogLevel;
  private readonly rtmpConfig: {[index: string]: any};
  private readonly httpConfig: {[index: string]: any};


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
    const config = {
      // TODO: set via config
      /*
      0 - Don't log anything
      1 - Log errors
      2 - Log errors and generic info
      3 - Log everything (debug)
       */
      logType: 3,
      rtmp: this.rtmpConfig,
      http: this.httpConfig,
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


}
