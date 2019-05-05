import {RtmpConfig} from './interfaces/MainConfig';


const rtmpDefaults: RtmpConfig = {
  port: 1935,
  chunk_size: 60000,
  gop_cache: true,
  ping: 30,
  ping_timeout: 60
};


export default {
  serversDefaults: {
    host: 'localhost',
  },
  camDefaults: {
    src: {
      protocol: 'rtsp',
      port: 554,
    },
    //rtspStream: {},
    //browserStream: {},
    //thumb: {},
  },
  rtmpDefaults,
};
