/**
 * Start all the needed services for each camera
 */

import RtmpStream from './RtmpStream';
import ThumbMaker from '../thumb/ThumbMaker';
import Main from './Main';


export default class Cameras {
  private readonly main: Main;
  // they are made only on connection
  private readonly rtmpInstances: {[index: string]: RtmpStream} = {};
  // they work permanent
  private readonly thumbsMakers: {[index: string]: ThumbMaker} = {};


  constructor(main: Main) {
    this.main = main;
  }


  async start() {
    for (let camName of Object.keys(this.main.config.cams)) {
      this.main.log.info(`--> starting thumb maker of camera "${camName}"`);
      this.thumbsMakers[camName] = new ThumbMaker(this.main, camName);

      await this.thumbsMakers[camName].start();
    }
  }

  destroy() {
    for (let camName of Object.keys(this.rtmpInstances)) {
      this.stopRtmpCamServer(camName);
    }
  }


  isRtmpStreamRunning(camName: string): boolean {
    return Boolean(this.rtmpInstances[camName]);
  }

  async startRtmpStream(camName: string) {
    this.rtmpInstances[camName] = new RtmpStream(camName, this.main);

    await this.rtmpInstances[camName].start();
  }

  stopRtmpCamServer(camName: string) {
    if (!this.rtmpInstances[camName]) return;

    this.rtmpInstances[camName].destroy();
    delete this.rtmpInstances[camName];
  }

}
