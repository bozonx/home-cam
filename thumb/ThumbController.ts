import ThumbMaker from '../thumb/ThumbMaker';
import Context from '../lib/context/Context';


export default class ThumbController {
  private readonly context: Context;
  // they work permanent
  private readonly thumbsMakers: {[index: string]: ThumbMaker} = {};


  constructor(context: Context) {
    this.context = context;
  }


  // async start() {
  //   for (let camName of Object.keys(this.context.config.cams)) {
  //     this.context.log.info(`--> starting thumb maker of camera "${camName}"`);
  //     this.thumbsMakers[camName] = new ThumbMaker(this.context, camName);
  //
  //     await this.thumbsMakers[camName].start();
  //   }
  // }

  // destroy() {
  //   for (let camName of Object.keys(this.rtmpInstances)) {
  //     this.stopRtmpCamServer(camName);
  //   }
  // }


  isThumbMakerRunning(camName: string): boolean {
    return Boolean(this.thumbsMakers[camName]);
  }

  // async startRtmpStream(camName: string) {
  //   this.rtmpInstances[camName] = new RtmpStream(this.main, camName);
  //
  //   await this.rtmpInstances[camName].start();
  // }
  //
  // stopRtmpCamServer(camName: string) {
  //   if (!this.rtmpInstances[camName]) return;
  //
  //   this.rtmpInstances[camName].destroy();
  //   delete this.rtmpInstances[camName];
  // }

}
