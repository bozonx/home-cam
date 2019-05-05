const NodeMediaServer = require('node-media-server');

import Config from './Config';


export default class BrowserStream {
  private readonly config: Config;


  constructor(config: Config) {
    this.config = config;
  }


  start() {
    const config = {
      // TODO: set via config
      logType: 3,
      rtmp: {
        ...this.config.rtmp
        // port: 1935,
        // chunk_size: 60000,
        // gop_cache: true,
        // ping: 30,
        // ping_timeout: 60
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
  }

  destroy() {
    // TODO: !!!
  }

}
