import RestartedProcess from './RestartedProcess';
import IndexedEvents from './IndexedEvents';
import {StdHandler} from './SpawnProcess';


export default class Ffmpeg {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
  private readonly logDebug: (msg: string) => void;
  private readonly params: {[index: string]: any};
  private readonly restartTimeout?: number;
  private _proc?: RestartedProcess;
  private get proc(): RestartedProcess {
    return this._proc as any;
  }


  constructor(logDebug: (msg: string) => void, params: {[index: string]: any}, restartTimeout?: number) {
    this.logDebug = logDebug;
    this.params = params;
    this.restartTimeout = restartTimeout;
  }


  async start() {
    // TODO: check ffmpeg exist
    // TODO: read whereis - use abs path

    const params: string[] = this.makeParams(this.params);
    const cmd: string = `/usr/bin/ffmpeg ${params.join(' ')}`;
    const cwd = process.cwd();

    this.logDebug(`Starting ffmpeg on working dir: "${cwd}": ${cmd}`);

    this._proc = new RestartedProcess(cmd, cwd, this.restartTimeout);

    this._proc.start();

    this.proc.onStdOut(this.stdoutEvents.emit);
    this.proc.onError(this.stderrEvents.emit);
  }

  destroy() {
    this.proc.destroy();
    delete this._proc;
  }


  onStdOut(cb: StdHandler) {
    this.stdoutEvents.addListener(cb);
  }

  onError(cb: StdHandler) {
    this.stderrEvents.addListener(cb);
  }


  private makeParams(params: {[index: string]: any}): string[] {
    const result: string[] = [];

    for (let key of Object.keys(params)) {
      let paramStr: string;

      if (params[key]) {
        paramStr = `${key} ${params[key]}`;
      }
      else {
        paramStr = key;
      }

      result.push(paramStr);
    }

    return result;
  }

}
