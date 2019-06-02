import {CamConfig} from '../lib/interfaces/MainConfig';
import {makeUrl} from '../lib/helpers/helpers';
import Ffmpeg from '../lib/helpers/Ffmpeg';
import Context from '../lib/context/Context';


export default class RtmpStream {
  private readonly context: Context;
  private ffmpeg?: Ffmpeg;
  private readonly camName: string;


  constructor(context: Context, camName: string) {
    this.camName = camName;
    this.context = context;
  }


  async start() {
    const ffmpegParams: {[index: string]: any} = this.makeFrmpegParams();

    this.context.log.info(`==> starting ffmpeg rtmp translator from ${ffmpegParams.i} to ${this.makeDstUrl()}`);

    const ffmpeg = new Ffmpeg(this.context.log.debug, ffmpegParams);

    this.ffmpeg = ffmpeg;
    // start stream
    await ffmpeg.start();

    // print stdout in debug mode
    ffmpeg.onStdOut(this.context.log.debug);
    // print stderr to console
    ffmpeg.onError(this.context.log.debug);
  }

  destroy() {
    if (!this.ffmpeg) return;

    this.ffmpeg.destroy();
    delete this.ffmpeg;
  }


  private makeFrmpegParams(): {[index: string]: any} {
    const cam: CamConfig = this.context.config.cams[this.camName];
    // use ffmpeg params from cam config or use defaults
    const ffmpegProps = cam.ffmpeg || this.context.systemConfig.ffmpegDefaults;
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
      ...ffmpegProps,
      [this.makeDstUrl()]: undefined,
    };
  }

  private makeDstUrl(): string {
    return `"rtmp://localhost/live/${this.camName}"`;
  }

}
