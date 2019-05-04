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
    // TODO: which use????
    const cwd = undefined;

    this._proc = new RestartedProcess('ffmpeg', params, cwd, this.restartTimeout);

    this.proc.onError(this.errEvents.emit);
  }

  onEror(cb: ErrorHandler) {
    this.errEvents.addListener(cb);
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
