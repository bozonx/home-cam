import ThumbMaker from '../thumb/ThumbMaker';
import Context from '../lib/context/Context';
import {IncomingMessage, ServerResponse} from "http";


export default class ThumbController {
  private readonly context: Context;
  // they work permanent
  private readonly thumbsMakers: {[index: string]: ThumbMaker} = {};


  constructor(context: Context) {
    this.context = context;
  }


  handleStaticRequest = (request: IncomingMessage, response: ServerResponse) => {
    const camName: string | undefined = this.parseCamNameFromUrl(request.url);

    if (!camName) return;

    // TODO: сделать сессию

    // do nothing if it is running
    if (this.thumbsMakers[camName]) return;

    this.startMaker(camName)
      .catch(this.context.log.error);
  }


  // async start() {
  //   for (let camName of Object.keys(this.context.config.cams)) {
  //     this.context.log.info(`--> starting thumb maker of camera "${camName}"`);
  //     this.thumbsMakers[camName] = new ThumbMaker(this.context, camName);
  //
  //     await this.thumbsMakers[camName].start();
  //   }
  // }

  destroy() {
    // TODO: stop session timers
    for (let camName of Object.keys(this.thumbsMakers)) {
      this.stopMaker(camName);
    }
  }


  isThumbMakerRunning(camName: string): boolean {
    return Boolean(this.thumbsMakers[camName]);
  }

  private async startMaker(camName: string) {
    this.thumbsMakers[camName] = new ThumbMaker(this.context, camName);

    await this.thumbsMakers[camName].start();
  }

  private stopMaker(camName: string) {
    if (!this.thumbsMakers[camName]) return;

    this.thumbsMakers[camName].destroy();
    delete this.thumbsMakers[camName];
  }

  private parseCamNameFromUrl(rawUrl?: string): string | undefined {
    // TODO: проверить что это именно thumb
  }

}
