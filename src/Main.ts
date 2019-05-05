import Config from './Config';
import BrowserStream from './BrowserStream';
import {CamConfig} from './interfaces/MainConfig';
import Ffmpeg from './Ffmpeg';
import {makeUrl, splitLastElement} from './helpers/helpers';
import systemConfig from './systemConfig';


export default class Main {
  readonly config: Config;
  readonly systemConfig = systemConfig;
  readonly browserStream: BrowserStream;
  private readonly rtmpInstances: {[index: string]: Ffmpeg} = {};


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
    const cam: CamConfig = this.config.cams[camName];
    const srcUrl = makeUrl(
      cam.src.protocol,
      cam.src.host,
      cam.src.port,
      cam.src.url,
      cam.src.user,
      cam.src.password
    );
    const dstUrl = `"rtmp://localhost/live/${camName}"`;

    console.info(`==> starting ffmpeg rtmp translator from "${srcUrl}" to ${dstUrl}`);

    // TODO: use params from cam config

    this.rtmpInstances[camName] = new Ffmpeg({
      'i': `"${srcUrl}"`,
      'c:v': 'libx264',
      'preset': 'superfast',
      'tune': 'zerolatency',
      'c:a': 'aac',
      'ar': 44100,
      'f': 'flv',
      [dstUrl]: undefined,
    });

    await this.rtmpInstances[camName].start();
    this.rtmpInstances[camName].onError(console.error)
  }

  private stopRtmpCamServer(camName: string) {
    if (!this.rtmpInstances[camName]) return;

    this.rtmpInstances[camName].destroy();
    delete this.rtmpInstances[camName];
  }

}
