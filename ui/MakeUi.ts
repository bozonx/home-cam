import * as _ from 'lodash';
import * as path from 'path';

import Main from '../webStream/Main';
import {REPO_ROOT, UI_DIR, WWW_ROOT_DIR} from '../lib/helpers/constants';


const INDEX_HTML_TPL = `
<!doctype html>
<html>
<head>
<link rel="stylesheet" type="text/css" href="cam-view/home-cam-view.css" />
<script src="cam-view/home-cam-view.js"></script>
</head>
<body>
\${body}
<script src="https://cdn.bootcss.com/flv.js/1.5.0/flv.min.js"></script>
</body>
</html>
`;


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
    let body: string = '';

    for (let camName of Object.keys(this.main.config.cams)) {

    }

    return _.template(INDEX_HTML_TPL)({ body });
  }

}
