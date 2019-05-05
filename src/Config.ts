import * as _ from 'lodash';

import MainConfig, {CamConfig, CommonServerConfig, RtmpConfig} from './interfaces/MainConfig';
import Os from './helpers/Os';
import Main from './Main';


export default class Config {
  get cams(): {[index: string]: CamConfig} {
    return (this.config as any).cams;
  }
  get browserStreamServer(): CommonServerConfig {
    return (this.config as any).browserStreamServer;
  }
  get rtmp(): RtmpConfig {
    return (this.config as any).rtmp;
  }
  private config?: MainConfig;
  private readonly main: Main;
  private readonly os: Os = new Os();
  private readonly configPath: string;


  constructor(configPath: string, main: Main) {
    this.configPath = configPath;
    this.main = main;
  }


  async make() {
    const preConfig = await this.os.loadYamlFile(this.configPath);

    this.validateConfig(preConfig);

    const cams: {[index: string]: CamConfig} = {};

    for (let camName of Object.keys(preConfig.cams)) {
      cams[camName] = this.prepareCam(preConfig, preConfig.cams[camName]);
    }

    this.config = {
      cams,
      browserStreamServer: this.prepareBrowserStreamServer(preConfig),
      rtmp: this.prepareRtmp(preConfig),

      // TODO: prepare it
      rtspStreamServer: preConfig.rtspStreamServer,
      // TODO: prepare it
      staticServer: preConfig.staticServer,

    }
  }


  private validateConfig(preConfig: {[index: string]: any}) {
    // TODO: make it
  }

  private prepareCam(preConfig: {[index: string]: any}, preCam: CamConfig): CamConfig {
    return _.defaultsDeep({}, preCam, preConfig.camDefaults, this.main.systemConfig.camDefaults);
  }

  private prepareBrowserStreamServer(preConfig: {[index: string]: any}): CommonServerConfig {
    return _.defaultsDeep({}, preConfig.browserStreamServer, this.main.systemConfig.browserStreamServer);
  }

  private prepareRtmp(preConfig: {[index: string]: any}): RtmpConfig {
    return _.defaultsDeep({}, preConfig.rtmp, this.main.systemConfig.rtmpDefaults);
  }

}
