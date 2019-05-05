import MainConfig, {CamConfig, CommonServerConfig, RtmpConfig} from './interfaces/MainConfig';
import Os from './helpers/Os';


export default class Config {
  get cams(): CamConfig[] {
    return (this.config as any).cams;
  }
  get browserStreamServer(): CommonServerConfig[] {
    return (this.config as any).browserStreamServer;
  }
  get rtmp(): RtmpConfig {
    return (this.config as any).rtmp;
  }
  private config?: MainConfig;
  private readonly os: Os = new Os();
  private readonly configPath: string;


  constructor(configPath: string) {
    this.configPath = configPath;
  }


  async make() {
    const preConfig = await this.os.loadYamlFile(this.configPath);

    this.validateConfig(preConfig);

    this.config = {
      cams: preConfig.cams.map(this.prepareCam),
      browserStreamServer: this.prepareBrowserStreamServer(preConfig),
      // TODO: prepare it
      rtspStreamServer: preConfig.rtspStreamServer,
      // TODO: prepare it
      staticServer: preConfig.staticServer,
      rtmp: this.prepareRtmp(preConfig),
    }
  }


  private validateConfig(preConfig: {[index: string]: any}) {
    // TODO: make it
  }

  private prepareCam = (preCam: CamConfig): CamConfig => {
    // TODO: make it
  }

  private prepareBrowserStreamServer(preCam: CamConfig): CommonServerConfig {
    // TODO: make it
  }

  private prepareRtmp(preCam: CamConfig): RtmpConfig {

  }

}
