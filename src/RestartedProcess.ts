import IndexedEvents from './helpers/IndexedEvents';
import SpawnProcess, {CloseHandler, StdHandler} from './helpers/SpawnProcess';


export default class RestartedProcess {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
  private readonly closeEvents = new IndexedEvents<CloseHandler>();
  private readonly cmd: string;
  private readonly cwd?: string;
  private readonly params: string[];


  constructor(cmd: string, params: string[], cwd?: string) {
    this.cmd = cmd;
    this.params = params;
    this.cwd = cwd;
  }


  start() {
    const proc = new SpawnProcess(this.cmd, this.params, this.cwd);
  }


  onStdOut(cb: StdHandler) {
    this.stdoutEvents.addListener(cb);
  }

  onError(cb: StdHandler) {
    this.stderrEvents.addListener(cb);
  }

  onClose(cb: (code: number) => void) {
    this.closeEvents.addListener(cb);
  }

}
