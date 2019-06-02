import * as _ from 'lodash';

import RtmpStream from './RtmpStream';
import Context from '../lib/context/Context';
import {splitLastElement} from '../lib/helpers/helpers';
import BrowserStream from './BrowserStream';


export default class WebStreamController {
  private readonly context: Context;
  private readonly browserStream: BrowserStream;
  // they are made only on connection
  private readonly rtmpInstances: {[index: string]: RtmpStream} = {};
  private stopRtmpDebounce?: (cb: () => void) => void;


  constructor(context: Context, browserStream: BrowserStream) {
    this.context = context;
    this.browserStream = browserStream;
  }


  start() {
    this.stopRtmpDebounce = _.debounce(
      (cb: () => void) => cb(),
      this.context.config.config.rtmpStopDelaySec * 1000
    );
  }

  destroy() {
    for (let camName of Object.keys(this.rtmpInstances)) {
      this.stopRtmpCamServer(camName);
    }
  }


  handleStreamOpenConnection = async (streamPath: string) => {
    const camName: string = splitLastElement(streamPath, '/')[0];

    this.context.log.info(`===> Starting ffmpeg's RTMP stream for camera "${camName}"`);

    // don't run if it has been started previously
    if (this.isRtmpStreamRunning(camName)) return;

    try {
      await this.startRtmpStream(camName);
    }
    catch (err) {
      this.context.log.error(err);
    }
  }

  handleStreamCloseConnection = (streamPath: string) => {
    // don't stop if some else is connected
    if (this.browserStream.hasAnyConnected(streamPath)) return;

    const camName: string = splitLastElement(streamPath, '/')[0];

    this.stopRtmpDebounce && this.stopRtmpDebounce(() => {
      // don't stop if someone ans been connected while it waits
      if (this.browserStream.hasAnyConnected(streamPath)) return;

      this.context.log.info(`===> Stopping ffmpeg's rtmp stream for camera "${camName}"`);

      this.stopRtmpCamServer(camName);
    });
  }


  private isRtmpStreamRunning(camName: string): boolean {
    return Boolean(this.rtmpInstances[camName]);
  }

  private async startRtmpStream(camName: string) {
    this.rtmpInstances[camName] = new RtmpStream(this.context, camName);

    await this.rtmpInstances[camName].start();
  }

  private stopRtmpCamServer(camName: string) {
    if (!this.rtmpInstances[camName]) return;

    this.rtmpInstances[camName].destroy();
    delete this.rtmpInstances[camName];
  }

}
