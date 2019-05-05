import * as childProcess from 'child_process';
import {ChildProcess} from "child_process";
import IndexedEvents from './IndexedEvents';


export type StdHandler = (msg: string) => void;
export type CloseHandler = (code: number) => void;


export default class SpawnProcess {
  private readonly stdoutEvents = new IndexedEvents<StdHandler>();
  private readonly stderrEvents = new IndexedEvents<StdHandler>();
  private readonly closeEvents = new IndexedEvents<CloseHandler>();
  private readonly cmd: string;
  private readonly cwd?: string;
  private readonly params: string[];
  private spawnedCmd?: ChildProcess;


  constructor(cmd: string, params: string[], cwd?: string) {
    this.cmd = cmd;
    this.cwd = cwd;
    this.params = params;
  }


  start() {
    const options = {
      cwd: this.cwd,
      shell: '/bin/bash',
      encoding: 'utf8',
    };

    const cmd: string = `${this.cmd} ${this.params.join(' ')}`;
    const spawnedCmd: ChildProcess | null = childProcess.spawn(cmd, options);

    if (!spawnedCmd) {
      throw new Error(`Can't spawn a process: "${cmd}"`);
    }
    else if (!spawnedCmd.stdout) {
      throw new Error(`No stdout of process: "${cmd}"`);
    }
    else if (!spawnedCmd.stderr) {
      throw new Error(`No stderr of process: "${cmd}"`);
    }

    this.spawnedCmd = spawnedCmd;

    // spawnedCmd.stdout.on('data', (data: Buffer) => console.log(data.toString('utf8')));
    //
    // spawnedCmd.stderr.on('data', (data: Buffer) => console.log(data.toString('utf8')));

    //spawnedCmd.on('close', () => console.log(11111111111111111));

    spawnedCmd.stdout.on('data', this.stdoutEvents.emit);
    spawnedCmd.stderr.on('data', this.stderrEvents.emit);
    spawnedCmd.on('close', this.closeEvents.emit);
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

  destroy() {
    // remove all the listeners
    this.stdoutEvents.removeAll();
    this.stderrEvents.removeAll();
    this.closeEvents.removeAll();
    if (this.spawnedCmd) this.spawnedCmd.kill('SIGTERM');
    delete this.spawnedCmd;
  }

}
