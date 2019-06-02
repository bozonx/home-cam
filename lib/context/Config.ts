import * as _ from 'lodash';
import * as path from 'path';

import MainConfig, {CamConfig, CommonConfig, CommonServerConfig, RtmpConfig} from '../interfaces/MainConfig';
import {makeUrl} from '../helpers/helpers';
import Context from './Context';


export default class Config {
  readonly workDir: string;
  get cams(): {[index: string]: CamConfig} {
    return (this.mainConfig as any).cams;
  }
  get browserStreamServer(): CommonServerConfig {
    return (this.mainConfig as any).browserStreamServer;
  }
  get staticServer(): CommonServerConfig {
    return (this.mainConfig as any).staticServer;
  }
  get rtmp(): RtmpConfig {
    return (this.mainConfig as any).rtmp;
  }
  get config(): CommonConfig {
    return (this.mainConfig as any).config;
  }
  private mainConfig?: MainConfig;
  private readonly context: Context;
  private readonly configPath: string;


  constructor(context: Context, configPath: string, workDir?: string) {
    if (!workDir) {
      throw new Error(`ERROR: You have to specify a --work-dir param`);
    }

    this.configPath = configPath;
    this.workDir = path.resolve(process.cwd(), workDir);
    this.context = context;
  }


  async make() {
    const preConfig = await this.context.os.loadYamlFile(this.configPath);

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
      staticServer: this.prepareStaticServer(preConfig),
      config: this.makeCommonConfig(preConfig),
    };
  }

  getBrowserStreamBaseUrl() {
    //http://${this.main.config.browserStreamServer.host}:8081
    return makeUrl(
      this.browserStreamServer.protocol,
      this.browserStreamServer.host,
      this.browserStreamServer.port,
      undefined,
      this.browserStreamServer.user,
      this.browserStreamServer.password,
    );
  }


  private validateConfig(preConfig: {[index: string]: any}) {
    // TODO: make it
  }

  private prepareCam(preConfig: {[index: string]: any}, preCam: CamConfig): CamConfig {
    const camConfig: CamConfig = _.defaultsDeep(
      {},
      preCam,
      preConfig.camDefaults,
      this.context.systemConfig.camDefaults
    );

    camConfig.thumb = _.defaultsDeep({}, camConfig.thumb, this.context.systemConfig.thumbDefaults);

    return camConfig;
  }

  private prepareBrowserStreamServer(preConfig: {[index: string]: any}): CommonServerConfig {
    return _.defaultsDeep({}, preConfig.browserStreamServer, this.context.systemConfig.browserStreamServer);
  }

  private prepareStaticServer(preConfig: {[index: string]: any}): CommonServerConfig {
    return _.defaultsDeep({}, preConfig.staticServer, this.context.systemConfig.staticServer);
  }

  private prepareRtmp(preConfig: {[index: string]: any}): RtmpConfig {
    return _.defaultsDeep({}, preConfig.rtmp, this.context.systemConfig.rtmpDefaults);
  }

  private makeCommonConfig(preConfig: {[index: string]: any}): CommonConfig {
    return _.defaultsDeep({}, preConfig.config, this.context.systemConfig.config);
  }

}
