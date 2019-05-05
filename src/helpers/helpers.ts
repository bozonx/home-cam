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

  if (user) result += _.compact([user, password]).join(':') + '@';
  result += _.compact([host, port]).join(':');
  if (url) result += '/' + _.trimStart(url, '/');

  return result;
}
