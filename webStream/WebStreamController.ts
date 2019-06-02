import RtmpStream from './RtmpStream';
import Context from '../lib/context/Context';


export default class WebStreamController {
  private readonly context: Context;
  // they are made only on connection
  private readonly rtmpInstances: {[index: string]: RtmpStream} = {};


  constructor(context: Context) {
    this.context = context;
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
    this.rtmpInstances[camName] = new RtmpStream(this.main, camName);

    await this.rtmpInstances[camName].start();
  }

  stopRtmpCamServer(camName: string) {
    if (!this.rtmpInstances[camName]) return;

    this.rtmpInstances[camName].destroy();
    delete this.rtmpInstances[camName];
  }

}
