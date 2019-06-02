import {RtmpConfig} from '../lib/interfaces/MainConfig';


const rtmpDefaults: RtmpConfig = {
  port: 1935,
  chunk_size: 60000,
  gop_cache: true,
  ping: 30,
  ping_timeout: 60
};


export default {
  browserStreamServer: {
    protocol: 'http',
    host: '0.0.0.0',
    port: 8081,
  },
  staticServer: {
    protocol: 'http',
    host: '0.0.0.0',
    port: 8082,
  },
  camDefaults: {
    src: {
      protocol: 'rtsp',
      port: 554,
    },
  },
  rtmpDefaults,
  ffmpegDefaults: {
    '-c:v': 'libx264',
    '-preset': 'superfast',
    '-tune': 'zerolatency',
    '-c:a': 'aac',
    '-ar': 44100,
    '-f': 'flv',
  },
  thumbDefaults: {
    updateIntervalSec: 10,
  },
  // app config
  config: {
    rtmpStopDelaySec: 10,
  }
};
