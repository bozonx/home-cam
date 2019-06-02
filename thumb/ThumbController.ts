import Timer = NodeJS.Timer;
import {IncomingMessage, ServerResponse} from 'http';

import ThumbMaker from '../thumb/ThumbMaker';
import Context from '../lib/context/Context';
import {CamConfig} from '../lib/interfaces/MainConfig';


const SESSION_MULTIPLIER = 10;


export default class ThumbController {
  private readonly context: Context;
  // they work permanent
  private readonly thumbsMakers: {[index: string]: ThumbMaker} = {};
  private readonly sessionTimers: {[index: string]: Timer} = {};


  constructor(context: Context) {
    this.context = context;
  }

  destroy() {
    // TODO: stop session timers
    for (let camName of Object.keys(this.sessionTimers)) {
      clearTimeout(this.sessionTimers[camName]);
      delete this.sessionTimers[camName];
    }

    for (let camName of Object.keys(this.thumbsMakers)) {
      this.stopMaker(camName);
      delete this.thumbsMakers[camName];
    }
  }


  handleStaticRequest = (request: IncomingMessage, response: ServerResponse) => {
    const camName: string | undefined = this.parseCamNameFromUrl(request.url);

    if (!camName) return;

    this.updateSession(camName);

    // do nothing if it is running
    if (this.thumbsMakers[camName]) return;

    this.startMaker(camName)
      .catch(this.context.log.error);
  }


  isThumbMakerRunning(camName: string): boolean {
    return Boolean(this.thumbsMakers[camName]);
  }

  private async startMaker(camName: string) {
    this.context.log.info(`--> starting thumb maker of camera "${camName}"`);

    this.thumbsMakers[camName] = new ThumbMaker(this.context, camName);

    await this.thumbsMakers[camName].start();
  }

  private stopMaker(camName: string) {
    if (!this.thumbsMakers[camName]) return;

    this.context.log.info(`--> stopping thumb maker of camera "${camName}"`);
    this.thumbsMakers[camName].destroy();
    delete this.thumbsMakers[camName];
  }

  private updateSession(camName: string) {
    clearTimeout(this.sessionTimers[camName]);

    const camConfig: CamConfig = this.context.config.cams[camName];

    this.sessionTimers[camName] = setTimeout(() => {
      delete this.sessionTimers[camName];
      this.stopMaker(camName);
    }, camConfig.thumb.updateIntervalSec * SESSION_MULTIPLIER);
  }

  private parseCamNameFromUrl(rawUrl?: string): string | undefined {
    // TODO: проверить что это именно thumb
  }

}
