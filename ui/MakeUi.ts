import * as path from 'path';

import Main from '../webStream/Main';
import {REPO_ROOT, UI_DIR, WWW_ROOT_DIR} from '../lib/helpers/constants';


export default class MakeUi {
  private readonly main: Main;


  constructor(main: Main) {
    this.main = main;
  }


  async make() {
    // TODO: add
    const uiDir = path.join(this.main.config.workDir, WWW_ROOT_DIR, UI_DIR);
    const indexHtmlPath = path.join(uiDir, 'index.html');
    const indexHtml = this.makeIndexHtml();

    await this.main.os.mkdirP(uiDir);
    await this.main.os.writeFile(indexHtmlPath, indexHtml);

    await this.main.os.copyFile(
      path.join(REPO_ROOT, 'cam-view', 'home-cam-view.js'),
      path.join(uiDir, 'cam-view', 'home-cam-view.js')
    );
    await this.main.os.copyFile(
      path.join(REPO_ROOT, 'cam-view', 'home-cam-view.css'),
      path.join(uiDir, 'cam-view', 'home-cam-view.css')
    );
  }


  private makeIndexHtml(): string {

  }

}
