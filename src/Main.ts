import Config from './Config';
import BrowserStream from './BrowserStream';


export default class Main {
  readonly config: Config;
  readonly browserStream: BrowserStream;


  constructor(configPath: string) {
    this.config = new Config(configPath);
    this.config.make();
    this.browserStream = new BrowserStream(this.config);
  }

}
