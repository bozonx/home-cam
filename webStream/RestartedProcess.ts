import IndexedEvents from '../lib/helpers/IndexedEvents';
import SpawnProcess, {StdHandler} from '../lib/helpers/SpawnProcess';


// in ms
const DEFAULT_RESTART_TIMEOUT = 1000;


export default class RestartedProcess {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly errorEvents = new IndexedEvents<StdHandler>();
  private readonly cmd: string;
  private readonly cwd?: string;
  private readonly restartTimeoutMs: number;
  private proc?: SpawnProcess;
  private restartTimeout: any;


  constructor(cmd: string, cwd?: string, restartTimeoutMs: number = DEFAULT_RESTART_TIMEOUT) {
    this.cmd = cmd;
    this.cwd = cwd;
    this.restartTimeoutMs = restartTimeoutMs;
  }

  start() {
    this.makeInstance();
  }

  destroy() {
    clearTimeout(this.restartTimeout);
    this.stdoutEvents.removeAll();
    this.errorEvents.removeAll();
    if (this.proc) this.proc.destroy();
    delete this.proc;
  }


  onStdOut(cb: StdHandler) {
    this.stdoutEvents.addListener(cb);
  }

  onError(cb: StdHandler) {
    this.errorEvents.addListener(cb);
  }


  private makeInstance = () => {
    // make new instance
    this.proc = new SpawnProcess(this.cmd, this.cwd);
    // listen events
    this.proc.onStdOut(this.stdoutEvents.emit);
    this.proc.onError(this.errorEvents.emit);
    this.proc.onClose(this.handleProcClose);

    try {
      this.proc.start();
    }
    catch (err) {
      // print error
      this.errorEvents.emit(`RestartedProcess: can't start a process: "${this.cmd}": ${err}`);
      // fully restart a process
      this.restart();

      return;
    }
  }

  /**
   * It rises if process is closed as soon as starts and if it is closed while processing.
   */
  private handleProcClose = (code: number) => {
    if (code) {
      this.errorEvents.emit(`RestartedProcess: cmd "${this.cmd}" has been closed with non zero code "${code}"`)
    }

    this.restart();
  }

  private restart() {
    this.errorEvents.emit(`RestartedProcess: restarting cmd "${this.cmd}"`);
    // destroy previous instance if exist
    if (this.proc) this.proc.destroy();
    // wait to restart
    this.restartTimeout = setTimeout(this.makeInstance, this.restartTimeoutMs);
  }

}
