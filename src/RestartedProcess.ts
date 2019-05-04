import IndexedEvents from './helpers/IndexedEvents';
import SpawnProcess, {CloseHandler, StdHandler} from './helpers/SpawnProcess';


// in ms
const DEFAULT_RESTART_TIMEOUT = 1000;


export default class RestartedProcess {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
  private readonly cmd: string;
  private readonly cwd?: string;
  private readonly params: string[];
  private readonly restartTimeout: number;
  private proc?: SpawnProcess;


  constructor(cmd: string, params: string[], cwd?: string, restartTimeout: number = DEFAULT_RESTART_TIMEOUT) {
    this.cmd = cmd;
    this.params = params;
    this.cwd = cwd;
    this.restartTimeout = restartTimeout;
  }


  start() {
    this.makeInstance();
  }


  onStdOut(cb: StdHandler) {
    this.stdoutEvents.addListener(cb);
  }

  onError(cb: StdHandler) {
    this.stderrEvents.addListener(cb);
  }


  private makeInstance = () => {
    if (this.proc) this.proc.destroy();

    this.proc = new SpawnProcess(this.cmd, this.params, this.cwd);

    try {
      this.proc.start();
    }
    catch (err) {
      console.error(`RestartedProcess: ${err}`);
      // restart
      setTimeout(this.makeInstance, this.restartTimeout);
    }

    this.proc.onStdOut(this.stdoutEvents.emit);
    this.proc.onError(this.stderrEvents.emit);
    this.proc.onClose((code: number) => {
      // reconnect

      if (code) {
        console.error(`RestartedProcess: cmd "${this.cmd}" has been closed with non zero code "${code}"`)
      }

      // restart
      setTimeout(this.makeInstance, this.restartTimeout);
    });
  }

}
