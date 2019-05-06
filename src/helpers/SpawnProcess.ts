import * as childProcess from 'child_process';
import {ChildProcess} from "child_process";
import IndexedEvents from './IndexedEvents';
import {ENCODE} from './constants';


export type StdHandler = (msg: string) => void;
export type CloseHandler = (code: number) => void;


export default class SpawnProcess {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
  private readonly closeEvents = new IndexedEvents<CloseHandler>();
  private readonly cmd: string;
  private readonly cwd?: string;
  private spawnedCmd?: ChildProcess;
  private closed: boolean = false;


  constructor(cmd: string, cwd?: string) {
    this.cmd = cmd;
    this.cwd = cwd;
  }


  start() {
    const options = {
      cwd: this.cwd,
      shell: '/bin/bash',
      encoding: 'utf8',
    };

    const spawnedCmd: ChildProcess | null = childProcess.spawn(this.cmd, options);

    if (!spawnedCmd) {
      throw new Error(`Can't spawn a process: "${this.cmd}"`);
    }
    else if (!spawnedCmd.stdout) {
      throw new Error(`No stdout of process: "${this.cmd}"`);
    }
    else if (!spawnedCmd.stderr) {
      throw new Error(`No stderr of process: "${this.cmd}"`);
    }

    this.spawnedCmd = spawnedCmd;

    spawnedCmd.stdout.on('data', (data: Buffer) => {
      this.stdoutEvents.emit(data.toString(ENCODE))
    });
    spawnedCmd.stderr.on('data', (data: Buffer) => {
      this.stderrEvents.emit(data.toString(ENCODE))
    });
    spawnedCmd.on('close', (code: number) => {
      this.closed = true;
      this.closeEvents.emit(code);
    });
  }

  destroy() {
    // remove all the listeners
    this.stdoutEvents.removeAll();
    this.stderrEvents.removeAll();
    this.closeEvents.removeAll();
    if (this.spawnedCmd) this.spawnedCmd.kill('SIGTERM');
    delete this.spawnedCmd;
  }


  isClosed(): boolean {
    return this.closed;
  }

  onStdOut(cb: StdHandler) {
    this.stdoutEvents.addListener(cb);
  }

  onError(cb: StdHandler) {
    this.stderrEvents.addListener(cb);
  }

  onClose(cb: (code: number) => void) {
    this.closeEvents.addListener(cb);
    this.destroy();
  }

}
