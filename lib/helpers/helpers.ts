import * as _ from 'lodash';
import LogLevel, {LOG_LEVELS} from '../interfaces/LogLevel';


/**
 * Call error-first callback functions like a promised
 */
export function callPromised(method: Function, ...params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      method(...params, (err: Error, data: any) => {
        if (err) return reject(err);

        resolve(data);
      });
    }
    catch (err) {
      reject(err);
    }
  });
}

export function makeUrl(
  protocol: string,
  host: string,
  port?: number,
  url?: string,
  user?: string,
  password?: string
): string {
  let result = protocol + '://';

  // user:password
  if (user) result += _.compact([user, password]).join(':') + '@';
  // host:port
  result += _.compact([host, port]).join(':');
  // url
  if (url) result += '/' + _.trimStart(url, '/');

  return result;
}

/**
 * Split last part of path. 'path/to/dest' => [ 'dest', 'path/to' ]
 */
export function splitLastElement(
  fullPath: string,
  separator: string
): [ string, string | undefined ] {
  if (!fullPath) throw new Error(`fullPath param is required`);
  if (!separator) throw new Error(`separator is required`);

  const split = fullPath.split(separator);
  const last: string = split[split.length - 1];

  if (split.length === 1) {
    return [ fullPath, undefined ];
  }

  // remove last element from path
  split.pop();

  return [ last, split.join(separator) ];
}

/**
 * Makes ['info', 'warn', 'error'] if log level is 'info'
 */
export function calcAllowedLogLevels(logLevel: LogLevel): LogLevel[] {
  const currentLevelIndex: number = LOG_LEVELS.indexOf(logLevel);

  return LOG_LEVELS.slice(currentLevelIndex) as LogLevel[];
}

export function listenDestroySignals(destroyTimeoutSec: number, destroy: () => Promise<void>) {
  const gracefullyDestroy = async () => {
    setTimeout(() => {
      console.error(`ERROR: App hasn't been gracefully destroyed during "${destroyTimeoutSec}" seconds`);
      process.exit(3);
    }, destroyTimeoutSec * 1000);

    try {
      await destroy();
      process.exit(0);
    }
    catch (err) {
      console.error(err);
      process.exit(2);
    }
  };

  process.on('SIGTERM', gracefullyDestroy);
  process.on('SIGINT', gracefullyDestroy);
}
