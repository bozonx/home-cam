import Config from './Config';
import BrowserStream from './BrowserStream';
import {CamConfig} from './interfaces/MainConfig';
import Ffmpeg from './Ffmpeg';
import {makeUrl} from './helpers/helpers';


export default class Main {
  readonly config: Config;
  readonly browserStream: BrowserStream;
  private readonly rtmpInstances: {[index: string]: Ffmpeg} = {};


  constructor(configPath: string) {
    this.config = new Config(configPath);
    this.browserStream = new BrowserStream(this.config);
  }

  async start() {
    await this.config.make();

    for (let cam of this.config.cams) {
      this.startRtmpCamServer(cam);
    }
  }


  destroy() {
    for (let ffmpeg of Object.keys(this.rtmpInstances)) {
      this.rtmpInstances[ffmpeg].destroy();
      delete this.rtmpInstances[ffmpeg]
    }

    this.browserStream.destroy();
  }

  /**
   *
   * @param cam
   */
  startRtmpCamServer(cam: CamConfig) {
    // Works only with reconverting a codec
    // ffmpeg -i "rtsp://admin:admin@192.168.88.33:554/cam/realmonitor?channel=main&subtype=1" -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv "rtmp://localhost/live/cam0"
    // ffmpeg -i "rtsp://192.168.88.6:554/user=admin&password=&channel=1&stream=0.sdp" -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv "rtmp://localhost/live/cam0"

    // file:
    //ffmpeg -re -i /home/ivan/Downloads/test.mp4 -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://localhost/live/cam0

    const srcUrl = makeUrl(cam.src.protocol, cam.src.host, cam.src.port, cam.src.url, cam.src.user, cam.src.password);
    const dsrUrl = `rtmp://localhost/live/${cam.name}`;

    this.rtmpInstances[cam.name] = new Ffmpeg({
      'i': srcUrl,
      'c:v': 'libx264',
      'preset': 'superfast',
      'tune': 'zerolatency',
      'c:a': 'aac',
      'ar': 44100,
      'f': 'flv',
      [dsrUrl]: undefined,
    });
  }

}
