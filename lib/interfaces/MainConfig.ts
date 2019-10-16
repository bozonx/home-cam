type SrcProtocols = 'rtsp';


export interface CommonConfig {
  rtmpStopDelaySec: number;
}

export interface StreamParams {
  frameRate?: number;
  width?: number;
  height?: number;
}

export interface ThumbConfig {
  width: number;
  height: number;
  // Make image if someone is viewing it. In seconds
  updateIntervalSec: number;
}

export interface CamConfig {
  src: {
    // one of supported src protocols
    protocol: SrcProtocols;
    // user for basic auth
    user?: string;
    // password for basic auth
    password?: string;
    // host of source stream (camera)
    host: string;
    // port of source stream. Default is protocol's default port.
    port?: number;
    // url part after host:port. If need
    url?: string;
  };
  rtspStream: StreamParams;
  browserStream: StreamParams;
  thumb: ThumbConfig;
  // options for ffmpeg RTMP stream. If isn't set then default compression will be used
  ffmpeg?: {[index: string]: any};
}

export interface RtmpConfig {
  port: number;
  chunk_size: number;
  gop_cache: boolean;
  ping: number;
  ping_timeout: number;
}

export interface CommonServerConfig {
  protocol: string;
  // host to listen to. Default is 0.0.0.0
  host: string;
  // port to listen to
  port: number;
  // user for basic auth
  user?: string;
  // password for basic auth
  password?: string;
}


export default interface MainConfig {
  cams: {[index: string]: CamConfig};
  // Default port is 8081
  browserStreamServer: CommonServerConfig;
  // Default port is 554
  rtspStreamServer: CommonServerConfig;
  // Default port is 8081
  staticServer: CommonServerConfig;
  // client and server params
  rtmp: RtmpConfig;
  config: CommonConfig;

  //camDefaults?: CamConfig;
  // serversDefaults: {
  //   // host to listen to. Default is 0.0.0.0
  //   host: string;
  //   // user for basic auth
  //   user?: string;
  //   // password for basic auth
  //   password?: string;
  // }
}
