import Config from './Config';

const NodeMediaServer = require('node-media-server');

// ffmpeg -re -i INPUT_FILE_NAME -c copy -f flv rtmp://localhost/live/STREAM_NAME


export default class BrowserStream {
  private readonly config: Config;


  constructor(config: Config) {
    this.config = config;
  }


  start() {
    //this.startFfmpeg();

    const config = {
      logType: 3,

      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
      },
      http: {
        port: 8000,
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

}
