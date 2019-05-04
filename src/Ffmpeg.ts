import RestartedProcess from './RestartedProcess';

export default class Ffmpeg {
  private readonly params: {[index: string]: any};
  private readonly restartTimeout?: number;
  private proc?: RestartedProcess;


  constructor(params: {[index: string]: any}, restartTimeout?: number) {
    this.params = params;
    this.restartTimeout = restartTimeout;


  }

  async start() {
    // TODO: check ffmpeg exist
    // TODO: read whereis - use abs path

    const params: string[] = this.makeParams(this.params);
    // TODO: which use????
    const cwd = undefined;

    this.proc = new RestartedProcess('ffmpeg', params, cwd, this.restartTimeout);


  }


  private makeParams(params: {[index: string]: any}): string[] {
    const result: string[] = [];

    for (let key of Object.keys(params)) {
      let paramStr: string;

      if (params[key]) {
        paramStr = `-${key} ${params[key]}`;
      }
      else {
        paramStr = `-${key}`;
      }

      result.push(paramStr);
    }

    return result;
  }

}
