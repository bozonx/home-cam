import * as path from 'path';

import Main from './Main';
import {UI_DIR, WWW_ROOT_DIR} from '../lib/helpers/constants';


export default class MakeUi {
  private readonly main: Main;


  constructor(main: Main) {
    this.main = main;
  }

  destroy() {
    // TODO: add
  }


  async make() {
    // TODO: add
    const uiDir = path.join(this.main.config.workDir, WWW_ROOT_DIR, UI_DIR);

    await this.main.os.mkdirP(uiDir);


  }


}
