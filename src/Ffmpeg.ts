import RestartedProcess from './RestartedProcess';
import IndexedEvents from './helpers/IndexedEvents';


type ErrorHandler = (err: string) => void;


export default class Ffmpeg {
  private readonly errEvents = new IndexedEvents<ErrorHandler>();
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

    //this.proc.onStdOut((msg: string) => console.log(msg));
    this.proc.onError(this.errEvents.emit);
  }

  onError(cb: ErrorHandler) {
    this.errEvents.addListener(cb);
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
