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
    for (let camName of Object.keys(this.rtmpInstances)) {
      // this.rtmpInstances[ffmpeg].destroy();
      // delete this.rtmpInstances[ffmpeg]

      this.stopRtmpCamServer(camName);
    }

    this.browserStream.destroy();
  }


  private handleBrowserOpenConnection = async (streamPath: string, id: string) => {
    const camName: string = splitLastElement(streamPath, '/')[0];

    console.info(`===> Starting ffmpeg's rtmp stream for camera "${camName}"`);

    try {
      await this.startRtmpCamServer(camName);
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

  private async startRtmpCamServer(camName: string) {
    // don't run if it was started
    if (this.rtmpInstances[camName]) return;

    const cam: CamConfig = this.config.cams[camName];
    // Works only with reconverting a codec
    // ffmpeg -i "rtsp://admin:admin@192.168.88.33:554/cam/realmonitor?channel=main&subtype=1" -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv "rtmp://localhost/live/cam0"
    // ffmpeg -i "rtsp://192.168.88.6:554/user=admin&password=&channel=1&stream=0.sdp" -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv "rtmp://localhost/live/cam0"

    // file:
    //ffmpeg -re -i /home/ivan/Downloads/test.mp4 -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://localhost/live/cam0

    const srcUrl = makeUrl(cam.src.protocol, cam.src.host, cam.src.port, cam.src.url, cam.src.user, cam.src.password);
    const dsrUrl = `"rtmp://localhost/live/${camName}"`;

    console.info(`==> starting ffmpeg rtmp translator from "${srcUrl}" to ${dsrUrl}`);

    this.rtmpInstances[camName] = new Ffmpeg({
      'i': `"${srcUrl}"`,
      'c:v': 'libx264',
      'preset': 'superfast',
      'tune': 'zerolatency',
      'c:a': 'aac',
      'ar': 44100,
      'f': 'flv',
      [dsrUrl]: undefined,
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
