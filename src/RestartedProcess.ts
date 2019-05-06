import IndexedEvents from './helpers/IndexedEvents';
import SpawnProcess, {StdHandler} from './helpers/SpawnProcess';


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
  private starting: boolean = false;
  

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
    this.starting = true;

    try {
      this.proc.start();
    }
    catch (err) {
      // print error
      this.errorEvents.emit(`RestartedProcess: ${err}`);
      // fully restart a process
      this.restart();
    }

    this.starting = false;
  }

  private handleProcClose = (code: number) => {
    // do noting if if was called while process is starting
    if (this.starting) return;
    
    // TODO: обработать случай если процесс выполнился и сразу закончился
    // TODO: больше не стартовать если задестроенно - при дестрое инстанса может вызываться close


    if (code) {
      this.errorEvents.emit(`RestartedProcess: cmd "${this.cmd}" has been closed with non zero code "${code}"`)
    }

    this.restart();
  }

  private restart() {
    // destroy previous instance if exist
    if (this.proc) this.proc.destroy();
    // wait to restart
    this.restartTimeout = setTimeout(this.makeInstance, this.restartTimeoutMs);
  }

  // private destroyInstance() {
  //   this.stdoutEvents.removeAll();
  //   this.errorEvents.removeAll();
  //   if (this.proc) this.proc.destroy();
  //   delete this.proc;
  // }

}
