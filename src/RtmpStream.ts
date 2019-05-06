import {CamConfig} from './interfaces/MainConfig';
import {makeUrl} from './helpers/helpers';
import Ffmpeg from './Ffmpeg';
import Main from './Main';


export default class RtmpStream {
  private ffmpeg?: Ffmpeg;
  private readonly camName: string;
  private readonly main: Main;


  constructor(camName: string, main: Main) {
    this.camName = camName;
    this.main = main;
  }


  async start() {
    const ffmpegParams: {[index: string]: any} = this.makeFrmpegParams();

    this.main.log.info(`==> starting ffmpeg rtmp translator from ${ffmpegParams.i} to ${this.makeDstUrl()}`);

    const ffmpeg = new Ffmpeg(ffmpegParams);

    this.ffmpeg = ffmpeg;
    // start stream
    await ffmpeg.start();

    // print stdout in debug mode
    ffmpeg.onStdOut(this.main.log.debug);
    // print stderr to console
    ffmpeg.onError(this.main.log.error)
  }

  destroy() {
    if (!this.ffmpeg) return;

    this.ffmpeg.destroy();
    delete this.ffmpeg;
  }


  private makeFrmpegParams(): {[index: string]: any} {
    const cam: CamConfig = this.main.config.cams[this.camName];

    // use ffmpeg params from cam config or use defaults
    const ffmpegProps = cam.ffmpeg || this.main.systemConfig.ffmpegDefaults;


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
      ...ffmpegProps,
      [this.makeDstUrl()]: undefined,
    };
  }

  private makeDstUrl(): string {
    return `"rtmp://localhost/live/${this.camName}"`;
  }

}
