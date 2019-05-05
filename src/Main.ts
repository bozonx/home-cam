import Config from './Config';
import BrowserStream from './BrowserStream';
import {splitLastElement} from './helpers/helpers';
import systemConfig from './systemConfig';
import RtmpStream from './RtmpStream';


export default class Main {
  readonly config: Config;
  readonly systemConfig = systemConfig;
  readonly browserStream: BrowserStream;
  private readonly rtmpInstances: {[index: string]: RtmpStream} = {};


  constructor(configPath: string) {
    this.config = new Config(configPath, this);
    this.browserStream = new BrowserStream(this.config);
  }


  async start() {
    await this.config.make();

    await this.browserStream.start();

    this.browserStream.onOpenConnection(this.handleBrowserOpenConnection);
    this.browserStream.onCloseConnection(this.handleBrowserCloseConnection);

    // for (let camName of Object.keys(this.config.cams)) {
    //   await this.startRtmpCamServer(camName);
    // }
  }


  destroy() {
    console.log(`--> closing ffmpeg RTMP streams`);
    for (let camName of Object.keys(this.rtmpInstances)) {
      this.stopRtmpCamServer(camName);
    }

    console.log(`--> closing browser stream`);
    this.browserStream.destroy();
  }


  private handleBrowserOpenConnection = async (streamPath: string) => {
    const camName: string = splitLastElement(streamPath, '/')[0];

    console.info(`===> Starting ffmpeg's RTMP stream for camera "${camName}"`);

    // don't run if it has been started previously
    if (this.rtmpInstances[camName]) return;

    try {
      await this.startRtmpStream(camName);
    }
    catch (err) {
      console.error(err);
    }
  }

  private handleBrowserCloseConnection = (streamPath: string, id: string) => {
    const anyConnected: boolean = this.browserStream.hasAnyConnected(streamPath);

    if (!anyConnected) {
      const camName: string = splitLastElement(streamPath, '/')[0];

      console.info(`===> Stopping ffmpeg's rtmp stream for camera "${camName}"`);

      // TODO: use debounce
      this.stopRtmpCamServer(camName);
    }
  }

  private async startRtmpStream(camName: string) {
    this.rtmpInstances[camName] = new RtmpStream(camName, this);

    await this.rtmpInstances[camName].start();
  }

  private stopRtmpCamServer(camName: string) {
    if (!this.rtmpInstances[camName]) return;

    this.rtmpInstances[camName].destroy();
    delete this.rtmpInstances[camName];
  }

}
