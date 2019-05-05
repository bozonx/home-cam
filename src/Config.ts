import MainConfig, {CamConfig, CommonServerConfig, RtmpConfig} from './interfaces/MainConfig';


export default class Config {
  readonly cams: CamConfig[];
  readonly browserStreamServer: CommonServerConfig;
  readonly rtmp: RtmpConfig;
  readonly config: MainConfig;
  private readonly configPath: string;


  constructor(configPath: string) {
    this.configPath = configPath;
  }


  make() {

  }

}
