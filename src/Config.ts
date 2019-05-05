import MainConfig, {CamConfig} from './interfaces/MainConfig';


export default class Config {
  readonly cams: CamConfig[];
  readonly config: MainConfig;
  private readonly configPath: string;


  constructor(configPath: string) {
    this.configPath = configPath;
  }


  make() {

  }

}
