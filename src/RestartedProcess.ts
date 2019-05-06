import IndexedEvents from './helpers/IndexedEvents';
import SpawnProcess, {StdHandler} from './helpers/SpawnProcess';


// in ms
const DEFAULT_RESTART_TIMEOUT = 1000;


export default class RestartedProcess {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
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
    //this.destroyInstance();
    clearTimeout(this.restartTimeout);
    this.stdoutEvents.removeAll();
    this.stderrEvents.removeAll();
    if (this.proc) this.proc.destroy();
    delete this.proc;
  }


  onStdOut(cb: StdHandler) {
    this.stdoutEvents.addListener(cb);
  }

  onError(cb: StdHandler) {
    this.stderrEvents.addListener(cb);
  }


  private makeInstance = () => {
    // destroy previous instance if exist
    if (this.proc) this.proc.destroy();

    // make new instance
    this.proc = new SpawnProcess(this.cmd, this.cwd);
    // listen events
    this.proc.onStdOut(this.stdoutEvents.emit);
    this.proc.onError(this.stderrEvents.emit);
    this.proc.onClose(this.handleProcClose);

    try {
      this.proc.start();
    }
    catch (err) {
      // destroy if can't start
      this.destroy();
      // print error
      this.stderrEvents.emit(`RestartedProcess: ${err}`);
      // fully restart a process
      this.restart();
    }
  }

  private handleProcClose = (code: number) => {
    // reconnect


    // TODO: больше не стартовать если задестроенно


    if (code) {
      // TODO: use stderrEvents
      console.error(`RestartedProcess: cmd "${this.cmd}" has been closed with non zero code "${code}"`)
    }

    // restart
    this.restart();
  }

  private restart() {
    this.restartTimeout = setTimeout(this.makeInstance, this.restartTimeoutMs);
  }

  // private destroyInstance() {
  //   this.stdoutEvents.removeAll();
  //   this.stderrEvents.removeAll();
  //   if (this.proc) this.proc.destroy();
  //   delete this.proc;
  // }

}
