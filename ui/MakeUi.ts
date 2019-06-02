import * as _ from 'lodash';
import * as path from 'path';

import Main from '../webStream/Main';
import {REPO_ROOT, THUMB_FILE_NAME, THUMBS_DIR, WWW_ROOT_DIR} from '../lib/helpers/constants';
import {CamConfig} from '../lib/interfaces/MainConfig';


const INDEX_HTML_TPL = `<!doctype html>
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
    const uiDir = path.join(this.main.config.workDir, WWW_ROOT_DIR);
    const camViewDirDir = path.join(uiDir, 'cam-view');
    const indexHtmlPath = path.join(uiDir, 'index.html');
    const indexHtml = this.makeIndexHtml();

    await this.main.os.mkdirP(camViewDirDir);
    await this.main.os.writeFile(indexHtmlPath, indexHtml);

    await this.main.os.copyFile(
      path.join(REPO_ROOT, 'cam-view', 'home-cam-view.js'),
      path.join(camViewDirDir, 'home-cam-view.js')
    );
    await this.main.os.copyFile(
      path.join(REPO_ROOT, 'cam-view', 'home-cam-view.css'),
      path.join(camViewDirDir, 'home-cam-view.css')
    );
  }


  private makeIndexHtml(): string {
    let body: string = '';

    for (let camName of Object.keys(this.main.config.cams)) {
      body += `<div id="cam-${camName}"></div>\n`;
    }

    body += this.makeScripts();

    return _.template(INDEX_HTML_TPL)({ body });
  }

  private makeScripts(): string {
    let result: string = '';

    result += '<script>';

    for (let camName of Object.keys(this.main.config.cams)) {
      const camConfig: CamConfig = this.main.config.cams[camName];

      if (!camConfig) {
        throw new Error(`MakeUi.makeIndexHtml: Can't find camera config ${camName}`);
      }

      result += _.compact([`placeCam('#cam-${camName}', {`,
        `streamUrl: '${this.main.config.getBrowserStreamBaseUrl()}/live/${camName}.flv',`,
        `thumbUrl: '${this.makeThimbImgPath(camName)}',`,
        camConfig.thumb.width && `thumbWidth: ${camConfig.thumb.width},`,
        camConfig.thumb.height && `thumbHeight: ${camConfig.thumb.height},`,
        camConfig.thumb.updateIntervalSec && `thumbUpdateIntervalSec: ${camConfig.thumb.updateIntervalSec},`,
        `});`]).join('\n');
    }

    result += '</script>';

    return result;
  }

  private makeThimbImgPath(camName: string): string {
    return '/' + [
      THUMBS_DIR,
      camName,
      THUMB_FILE_NAME,
    ].join('/');
  }

}
