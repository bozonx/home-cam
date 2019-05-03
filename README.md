# home-cam
Easily convert cam stream from rtsp to mgpeg. Make thumbnails and main stream only if client is connected.

## Start service

    home-cam ./my-config.yaml
    

## Config

    cams:
      - name: windowCam0
        src:
          protocol: rtsp
          user: admin
          pasword: admin
          host: 192.168.88.6
          port 554
          url: /user=admin&password=&channel=1&stream=0.sdp
        # ffmpeg works all the time
        mainStream:
          protocol: rtsps
          user: admin
          pasword: admin
          host: 0.0.0.0
          port 554
          url: /cam0
          frameRate: 25
          width: 1920
          height: 1080
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
      mainStreamDefaults:
        protocol: rtsp
        host: 0.0.0.0
        port 554
        url: "/${camName}"
        frameRate: 25
      mjpegStreamDefaults:
        frameRate: 25
      thumbDefaults:
        width: 680
        height: 308
        makeImage: 300
        updateInterval: 5
        frameRate: 25
      ui:
        host: 0.0.0.0
        port: 8182
        url: /ui
      httpServer:
        host: 0.0.0.0
        port 8181
        user: admin
        pasword: admin

## Http server

Available urls

* /cams/${camName}
* /thumbs/${camName}