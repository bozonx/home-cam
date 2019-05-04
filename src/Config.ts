import MainConfig from './interfaces/MainConfig';


export default class Config {
  readonly config: MainConfig;
  private readonly configPath: string;


  constructor(configPath: string) {
    this.configPath = configPath;
  }


  make() {

  }

}
