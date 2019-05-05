
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

  result += [host, port].join(':');

  return result;
}
