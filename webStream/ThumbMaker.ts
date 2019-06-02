import Ffmpeg from './Ffmpeg';
import Main from './Main';
import {CamConfig} from '../lib/interfaces/MainConfig';
import {makeUrl} from '../lib/helpers/helpers';


export default class ThumbMaker {
  private ffmpeg?: Ffmpeg;
  private readonly camName: string;
  private readonly main: Main;


  constructor(camName: string, main: Main) {
    this.camName = camName;
    this.main = main;
  }


  async start() {
    const ffmpegParams: {[index: string]: any} = this.makeFrmpegParams();

    this.main.log.info(`==> starting ffmpeg thumb maker from ${ffmpegParams.i} to ${this.makeDstFilePath()}`);

    const ffmpeg = new Ffmpeg(ffmpegParams);

    this.ffmpeg = ffmpeg;
    // start stream
    await ffmpeg.start();

    // print stdout in debug mode
    ffmpeg.onStdOut(this.main.log.debug);
    // print stderr to console
    ffmpeg.onError(this.main.log.debug)
  }

  destroy() {
    if (!this.ffmpeg) return;

    this.ffmpeg.destroy();
    delete this.ffmpeg;
  }


  // ffmpeg -i "rtsp://192.168.88.33/cam/realmonitor?channel=main&subtype=1" -y -f image2 -r 1/30 -update 1 img.jpg
  private makeFrmpegParams(): {[index: string]: any} {
    const cam: CamConfig = this.main.config.cams[this.camName];
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
      'i': `"${srcUrl}"`,
      '-y': undefined,
      '-f': 'image2',
      // TODO: set seconds
      '-r': '1/10',
      '-update': '1',
      [this.makeDstFilePath()]: undefined,
    };
  }

  private makeDstFilePath(): string {
    // TODO: make file path
    // TODO: use work dir
    return `img.jpg`;
  }

}
