import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as shelljs from 'shelljs';
import {callPromised} from './helpers';
import {ENCODE} from './constants';


export default class Os {
  getFileContent(pathTo: string): Promise<string> {
    return callPromised(fs.readFile, pathTo, ENCODE) as Promise<string>;
  }

  async loadYamlFile(fullPath: string): Promise<{[index: string]: any}> {
    const yamlContent: string = await this.getFileContent(fullPath);

    return yaml.safeLoad(yamlContent);
  }

  async mkdirP(dirName: string): Promise<void> {
    shelljs.mkdir('-p', dirName);
  }

}
