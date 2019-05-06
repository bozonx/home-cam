import LogLevel from './interfaces/LogLevel';
import {calcAllowedLogLevels} from './helpers/helpers';


export default class ConsoleLogger {
  readonly logLevel: LogLevel;
  private readonly isAllowedInfo: boolean;
  private readonly isAllowedWarn: boolean;


  constructor(logLevel: LogLevel) {
    const allowedLogLevels = calcAllowedLogLevels(logLevel);

    this.logLevel = logLevel;
    this.isAllowedInfo = allowedLogLevels.includes('info');
    this.isAllowedWarn = allowedLogLevels.includes('warn');
  }


  debug = (message: string) => {
    if (this.logLevel === 'debug') return;

    console.info(message);
  }

  info = (message: string) => {
    if (!this.isAllowedInfo) return;

    console.info(message);
  }

  warn = (message: string) => {
    if (!this.isAllowedWarn) return;

    console.warn(`WARNING: ${message}`);
  }

  error = (message: string) => {
    console.error(`ERROR: ${message}`);
  }

}
