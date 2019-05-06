import RestartedProcess from './RestartedProcess';
import IndexedEvents from './helpers/IndexedEvents';
import {StdHandler} from './helpers/SpawnProcess';


export default class Ffmpeg {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
  private readonly params: {[index: string]: any};
  private readonly restartTimeout?: number;
  private _proc?: RestartedProcess;
  private get proc(): RestartedProcess {
    return this._proc as any;
  }


  constructor(params: {[index: string]: any}, restartTimeout?: number) {
    this.params = params;
    this.restartTimeout = restartTimeout;


  }

  async start() {
    // TODO: check ffmpeg exist
    // TODO: read whereis - use abs path

    const params: string[] = this.makeParams(this.params);
    const cwd = process.cwd();

    this._proc = new RestartedProcess('ffmpeg', params, cwd, this.restartTimeout);

    this._proc.start();

    this.proc.onStdOut(this.stdoutEvents.emit);
    this.proc.onError(this.stderrEvents.emit);
  }

  onError(cb: StdHandler) {
    this.stderrEvents.addListener(cb);
  }

  destroy() {
    this.proc.destroy();
    delete this._proc;
  }


  private makeParams(params: {[index: string]: any}): string[] {
    const result: string[] = [];

    for (let key of Object.keys(params)) {
      let paramStr: string;

      if (params[key]) {
        paramStr = `-${key} ${params[key]}`;
      }
      else {
        paramStr = key;
      }

      result.push(paramStr);
    }

    return result;
  }

}
