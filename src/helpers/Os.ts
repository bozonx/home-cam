import * as fs from 'fs';
import * as childProcess from 'child_process';
import {ChildProcess} from "child_process";
import * as yaml from 'js-yaml';
import * as shelljs from 'shelljs';
import {callPromised} from './helpers';


export interface SpawnCmdResult {
  stdout: string[];
  stderr: string[];
  status: number;
}

const FILES_ENCODE = 'utf8';


export default class Os {
  getFileContent(pathTo: string): Promise<string> {
    return callPromised(fs.readFile, pathTo, FILES_ENCODE) as Promise<string>;
  }

  async loadYamlFile(fullPath: string): Promise<{[index: string]: any}> {
    const yamlContent: string = await this.getFileContent(fullPath);

    return yaml.safeLoad(yamlContent);
  }

  async mkdirP(dirName: string): Promise<void> {
    shelljs.mkdir('-p', dirName);
  }

  /**
   * Spawn command via /bin/bash and wait while it will be finished.
   * It don't write to console by itself, it just returns a complete result.
   * @param {string} cmd - your command
   * @param {string} cwd - working dir. Optional.
   * @return {Promise} with {stdout: String, stderr: String, status: Number}
   */
  spawnCmdOnce(cmd: string, cwd?: string): Promise<SpawnCmdResult> {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const options = {
      cwd,
      shell: '/bin/bash',
      encoding: 'utf8',
    };
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

    spawnedCmd.stdout.on('data', (data) => stdout.push(data));
    spawnedCmd.stderr.on('data', (err) => stderr.push(err));

    return new Promise((resolve) => {
      spawnedCmd.on('close', (code) => {
        const result = {
          stdout: stdout,
          stderr: stderr,
          status: code,
        };

        resolve(result);
      });
    });
  }

}
