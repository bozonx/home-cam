type SrcProtocols = 'rtsp';


interface CamConfig {
  name: string;
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
  rtspStream: {
    frameRate?: number;
    width: number;
    height?: number;
  };
  browserStream: {
    frameRate?: number;
    width: number;
    height?: number;
  };
  thumb: {
    // Make image if someone is viewing it. In seconds
    updateInterval: 5
  };

}


export default interface MainConfig {
  cams: CamConfig[];
  browserStreamServer: {
    // host to listen to. Default is 0.0.0.0
    host: string;
    // port to listen to. Default is 8081
    port?: number;
    // user for basic auth
    user?: string;
    // password for basic auth
    password?: string;
  };
  rtspStreamServer: {
    // host to listen to. Default is 0.0.0.0
    host: string;
    // port to listen to. Default is 554
    port?: number;
    // user for basic auth
    user?: string;
    // password for basic auth
    password?: string;
  };
  staticServer: {
    // host to listen to. Default is 0.0.0.0
    host: string;
    // port to listen to. Default is 8081
    port?: number;
    // user for basic auth
    user?: string;
    // password for basic auth
    password?: string;
  };

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
