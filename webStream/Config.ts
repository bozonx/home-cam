import * as _ from 'lodash';

import MainConfig, {CamConfig, CommonConfig, CommonServerConfig, RtmpConfig} from '../lib/interfaces/MainConfig';
import Os from '../lib/helpers/Os';
import Main from './Main';


export default class Config {
  get cams(): {[index: string]: CamConfig} {
    return (this.mainConfig as any).cams;
  }
  get browserStreamServer(): CommonServerConfig {
    return (this.mainConfig as any).browserStreamServer;
  }
  get rtmp(): RtmpConfig {
    return (this.mainConfig as any).rtmp;
  }
  get config(): CommonConfig {
    return (this.mainConfig as any).config;
  }
  private mainConfig?: MainConfig;
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

    this.mainConfig = {
      cams,
      browserStreamServer: this.prepareBrowserStreamServer(preConfig),
      rtmp: this.prepareRtmp(preConfig),

      // TODO: prepare it
      rtspStreamServer: preConfig.rtspStreamServer,
      // TODO: prepare it
      staticServer: preConfig.staticServer,
      config: this.makeCommonConfig(preConfig),
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

  private makeCommonConfig(preConfig: {[index: string]: any}): CommonConfig {
    return _.defaultsDeep({}, preConfig.config, this.main.systemConfig.config);
  }

}
