const NodeMediaServer = require('node-media-server');

// ffmpeg -re -i INPUT_FILE_NAME -c copy -f flv rtmp://localhost/live/STREAM_NAME

// Works only with reconverting a codec
// ffmpeg -i "rtsp://admin:admin@192.168.88.33:554/cam/realmonitor?channel=main&subtype=1" -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv "rtmp://localhost/live/cam0"
// ffmpeg -i "rtsp://192.168.88.6:554/user=admin&password=&channel=1&stream=0.sdp" -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv "rtmp://localhost/live/cam0"

// file:
//ffmpeg -re -i /home/ivan/Downloads/test.mp4 -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://localhost/live/cam0

export default class BrowserStream {
  constructor() {

  }

  start() {
    this.startFrmpeg();

    const config = {
      logType: 3,

      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
      },
      http: {
        port: 8000,
        allow_origin: '*'
      },

      // auth: {
      //   play: true,
      //   publish: true,
      //   secret: 'nodemedia2017privatekey'
      // }
    };

    var nms = new NodeMediaServer(config)
    nms.run();
  }

  startFrmpeg() {


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

}
