import * as _ from 'lodash';


/**
 * Call error-first callback functions like a promised
 */
export function callPromised(method: Function, ...params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    method(...params, (err: Error, data: any) => {
      if (err) return reject(err);

      resolve(data);
    });
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
