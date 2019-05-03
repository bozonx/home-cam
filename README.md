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
          user: admin
          pasword: admin
          host: 0.0.0.0
          port 8181
          url: /cam0    
          frameRate: 25
          width: 1920
          height: 1080
        # works only if someone is connected
        thumb:
          # update per seconds
          permanent: 300
          # update per seconds
          onRequest: 5
          protocol: rtsp
          user: admin
          pasword: admin
          host: 192.168.88.6
          port 8181
          url: /thumb
    config:
      thumbDefaults:
        width: 680
        height: 308
        onRequest: 5
        permanent: 300
      mainStreamDefaults:
        protocol: rtsp
        host: 0.0.0.0
        port 554
        url: "/${camName}"
        frameRate: 25
      mjpegStreamDefaults:
        protocol: mjpeg
        host: 0.0.0.0
        port 8181
        url: "/${camName}"
        frameRate: 25
      ui:
        host: 0.0.0.0
        port: 8182
        