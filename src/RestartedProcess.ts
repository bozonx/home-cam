import IndexedEvents from './helpers/IndexedEvents';
import SpawnProcess, {StdHandler} from './helpers/SpawnProcess';


// in ms
const DEFAULT_RESTART_TIMEOUT = 1000;


export default class RestartedProcess {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
  private readonly cmd: string;
  private readonly cwd?: string;
  private readonly restartTimeout: number;
  private proc?: SpawnProcess;


  constructor(cmd: string, cwd?: string, restartTimeout: number = DEFAULT_RESTART_TIMEOUT) {
    this.cmd = cmd;
    this.cwd = cwd;
    this.restartTimeout = restartTimeout;
  }

  start() {
    this.makeInstance();
  }

  destroy() {
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
    if (this.proc) this.proc.destroy();

    this.proc = new SpawnProcess(this.cmd, this.cwd);
    this.proc.onStdOut(this.stdoutEvents.emit);
    this.proc.onError(this.stderrEvents.emit);
    this.proc.onClose((code: number) => {
      // reconnect

      if (code) {
        // TODO: use stderrEvents
        console.error(`RestartedProcess: cmd "${this.cmd}" has been closed with non zero code "${code}"`)
      }

      // restart
      setTimeout(this.makeInstance, this.restartTimeout);
    });


    // TODO: review
    try {
      this.proc.start();
    }
    catch (err) {

      // TODO: отписаться

      // TODO: use stderrEvents
      console.error(`RestartedProcess: ${err}`);
      // restart
      setTimeout(this.makeInstance, this.restartTimeout);
    }

  }

}
