# home-cam
Easily convert cam stream from rtsp to mgpeg. Make thumbnails and main stream only if client is connected.


## Install

    sudo apt install ffmpeg


## Start service

    home-cam [--log-level] ./my-config.yaml
    
Params

* --log-level - One of log level: debug, info, warn, error. Default is info.
    

## Config

    cams:
      - name: windowCam0
        src:
          protocol: rtsp
          user: admin
          password: admin
          host: 192.168.88.6
          port 554
          url: /user=admin&password=&channel=1&stream=0.sdp
        # ffmpeg works all the time
        mainStream:
          frameRate: 25
          #width: 1920
          #height: 1080
          # work all the time
        # Stream for viewing in browser
        # ffmpeg starts server only if at least one client is connected
        mjpeg:
          frameRate: 25
          # make image per seconds
          makeImage: 300
          #width: 1920
          #height: 1080
        # works only if someone is connected
        thumb:
          # make image per seconds
          makeImage: 300
          # update per seconds
          updateInterval: 5
    config:
      defaults:
        mainStream:
          frameRate: 25
        mjpeg:
          frameRate: 25
        thumb:
          width: 680
          height: 308
          makeImage: 300
          updateInterval: 5
          frameRate: 25
      ui:
        host: 0.0.0.0
        port: 8182
      httpServer:
        host: 0.0.0.0
        port 8181
        user: admin
        pasword: admin
      rtspServer:
        user: admin
        pasword: admin
        host: 0.0.0.0
        port 554

## Http server

Available urls

* /cams/${camName} - mjpeg stream
* /thumbs/${camName} - mjpeg thumb stream
* /ui - manage cameras via browser


## Rtsp server

Available urls

* /cams/${camName} - streams for external recording
