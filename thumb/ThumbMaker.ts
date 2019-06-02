import * as path from 'path';

import Ffmpeg from '../lib/helpers/Ffmpeg';
import {CamConfig} from '../lib/interfaces/MainConfig';
import {makeUrl} from '../lib/helpers/helpers';
import {THUMB_FILE_NAME, THUMBS_DIR, WWW_ROOT_DIR} from '../lib/helpers/constants';
import Context from '../lib/context/Context';


export default class ThumbMaker {
  private ffmpeg?: Ffmpeg;
  private readonly camName: string;
  private readonly context: Context;


  constructor(context: Context, camName: string) {
    this.context = context;
    this.camName = camName;
  }

  destroy() {
    if (!this.ffmpeg) return;

    this.ffmpeg.destroy();
    delete this.ffmpeg;
  }


  async start() {
    const ffmpegParams: {[index: string]: any} = this.makeFrmpegParams();

    this.context.log.info(`==> starting ffmpeg thumb maker from ${ffmpegParams['-i']} to ${this.makeDstFilePath()}`);

    await this.context.os.mkdirP(this.makeDstDir());

    const ffmpeg = new Ffmpeg(this.context.log.debug, ffmpegParams);

    this.ffmpeg = ffmpeg;
    // start stream
    await ffmpeg.start();

    // print stdout in debug mode
    ffmpeg.onStdOut(this.context.log.debug);
    // print stderr to console
    ffmpeg.onError(this.context.log.debug)
  }


  // ffmpeg -i "rtsp://192.168.88.33/cam/realmonitor?channel=main&subtype=1" -y -f image2 -r 1/30 -update 1 img.jpg
  private makeFrmpegParams(): {[index: string]: any} {
    const cam: CamConfig = this.context.config.cams[this.camName];
    // use ffmpeg params from cam config or use defaults
    const srcUrl = makeUrl(
      cam.src.protocol,
      cam.src.host,
      cam.src.port,
      cam.src.url,
      cam.src.user,
      cam.src.password
    );

    return {
      '-i': `"${srcUrl}"`,
      '-y': undefined,
      '-f': 'image2',
      '-r': `1/${cam.thumb.updateIntervalSec}`,
      '-vf': `scale=${cam.thumb.width}:${cam.thumb.height}`,
      '-update': '1',
      [this.makeDstFilePath()]: undefined,
    };
  }

  private makeDstFilePath(): string {
    return path.join(
      this.makeDstDir(),
      THUMB_FILE_NAME
    );
  }

  private makeDstDir(): string {
    return path.join(
      this.context.config.workDir,
      WWW_ROOT_DIR,
      THUMBS_DIR,
      this.camName
    );
  }

}
