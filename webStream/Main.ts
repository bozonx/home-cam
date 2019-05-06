import Config from './Config';
import BrowserStream from './BrowserStream';
import {splitLastElement} from '../lib/helpers/helpers';
import systemConfig from './systemConfig';
import RtmpStream from './RtmpStream';
import Logger from '../lib/interfaces/Logger';
import LogLevel from '../lib/interfaces/LogLevel';
import * as _ from 'lodash';


export default class Main {
  readonly config: Config;
  readonly log: Logger;
  readonly systemConfig = systemConfig;
  readonly browserStream: BrowserStream;
  private readonly rtmpInstances: {[index: string]: RtmpStream} = {};
  private stopRtmpDebounce?: (cb: () => void) => void;


  constructor(
    configPath: string,
    LoggerClass: new (logLevel: LogLevel) => Logger,
    logLevel: LogLevel = 'info'
  ) {
    this.config = new Config(configPath, this);
    this.log = new LoggerClass(logLevel);
    this.browserStream = new BrowserStream(this);
  }


  async start() {
    await this.config.make();
    this.stopRtmpDebounce = _.debounce(
      (cb: () => void) => cb(),
      this.config.config.rtmpStopDelaySec * 1000
    );

    await this.browserStream.start();

    this.browserStream.onOpenConnection(this.handleBrowserOpenConnection);
    this.browserStream.onCloseConnection(this.handleBrowserCloseConnection);

    // for (let camName of Object.keys(this.config.cams)) {
    //   await this.startRtmpCamServer(camName);
    // }
  }


  destroy() {
    this.log.info(`--> closing ffmpeg RTMP streams`);
    for (let camName of Object.keys(this.rtmpInstances)) {
      this.stopRtmpCamServer(camName);
    }

    this.log.info(`--> closing browser stream`);
    this.browserStream.destroy();
  }


  private handleBrowserOpenConnection = async (streamPath: string) => {
    const camName: string = splitLastElement(streamPath, '/')[0];

    this.log.info(`===> Starting ffmpeg's RTMP stream for camera "${camName}"`);

    // don't run if it has been started previously
    if (this.rtmpInstances[camName]) return;

    try {
      await this.startRtmpStream(camName);
    }
    catch (err) {
      this.log.error(err);
    }
  }

  private handleBrowserCloseConnection = (streamPath: string) => {
    // don't stop if some else is connected
    if (this.browserStream.hasAnyConnected(streamPath)) return;

    const camName: string = splitLastElement(streamPath, '/')[0];

    this.stopRtmpDebounce && this.stopRtmpDebounce(() => {
      // don't stop if someone ans been connected while it waits
      if (this.browserStream.hasAnyConnected(streamPath)) return;

      this.log.info(`===> Stopping ffmpeg's rtmp stream for camera "${camName}"`);

      this.stopRtmpCamServer(camName);
    });
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
