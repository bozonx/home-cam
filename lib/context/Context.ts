import Config from './Config';
import Logger from '../interfaces/Logger';
import systemConfig from './systemConfig';
import LogLevel from '../interfaces/LogLevel';
import Os from './Os';


export default class Context {
  readonly config: Config;
  readonly log: Logger;
  readonly systemConfig = systemConfig;
  readonly os: Os = new Os();


  constructor(
    configPath: string,
    LoggerClass: new (logLevel: LogLevel) => Logger,
    workDir?: string,
    logLevel: LogLevel = 'info'
  ) {
    this.config = new Config(this, configPath, workDir);
    this.log = new LoggerClass(logLevel);
  }

}
