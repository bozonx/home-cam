import Config from './Config';
import BrowserStream from './BrowserStream';
import {CamConfig} from './interfaces/MainConfig';
import RestartedProcess from './RestartedProcess';
import Ffmpeg from './Ffmpeg';


export default class Main {
  readonly config: Config;
  readonly browserStream: BrowserStream;
  private readonly rtmpInstances: {[index: string]: Ffmpeg} = {};


  constructor(configPath: string) {
    this.config = new Config(configPath);
    this.config.make();
    this.browserStream = new BrowserStream(this.config);
  }

  async start() {

    for (let cam of this.config.cams) {
      this.startRtmpCamServer(cam);
    }

    //   try {
    //     const ffmpegProc = new ffmpeg('rtsp://admin:admin@192.168.88.33:554/cam/realmonitor?channel=main&subtype=1');
    //
    //     ffmpegProc.then(function (video: any) {
    //       console.log('The video is ready to be processed');
    //       video
    //       .setVideoCodec('libx264')
    //       .addCommand('-f', 'flv')
    //       .addCommand('-preset', 'superfast')
    //       .addCommand('-tune', 'zerolatency')
    //       .setAudioCodec('aac')
    //       .setAudioFrequency(41)
    //       .save('rtmp://localhost/live/cam0', function (error: Error, file: any) {
    //           if (!error)
    //             console.log('Video file: ' + file);
    //
    //         console.log(111111111, file)
    //         });
    //     }, function (err: Error) {
    //       console.log('Error: ' + err);
    //     });
    //   } catch (e) {
    //     console.log(e.code);
    //     console.log(e.msg);
    //   }
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

    this.rtmpInstances[cam.name] = new Ffmpeg({
      'i': makeUrl(cam.src.protocol, cam.src.host, cam.src.port, cam.src.url),

    });
  }

}
