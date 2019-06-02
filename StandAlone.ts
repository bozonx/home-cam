import Config from './lib/context/Config';
import BrowserStream from './webStream/BrowserStream';
import {splitLastElement} from './lib/helpers/helpers';
import systemConfig from './lib/context/systemConfig';
import Logger from './lib/interfaces/Logger';
import LogLevel from './lib/interfaces/LogLevel';
import * as _ from 'lodash';
import StaticServer from './ui/StaticServer';
import MakeUi from './ui/MakeUi';
import Os from './lib/context/Os';
import Cameras from './webStream/Cameras';


export default class StandAlone {
  private readonly browserStream: BrowserStream;
  private stopRtmpDebounce?: (cb: () => void) => void;
  private readonly staticServer: StaticServer;
  private readonly makeUi: MakeUi;
  private readonly cameras: Cameras;


  constructor(
    configPath: string,
    LoggerClass: new (logLevel: LogLevel) => Logger,
    workDir?: string,
    logLevel: LogLevel = 'info'
  ) {
    this.browserStream = new BrowserStream(this);
    this.staticServer = new StaticServer(this);
    this.makeUi = new MakeUi(this);
    this.cameras = new Cameras(this);
  }


  async start() {
    await this.config.make();
    this.stopRtmpDebounce = _.debounce(
      (cb: () => void) => cb(),
      this.config.config.rtmpStopDelaySec * 1000
    );

    this.log.info(`===> starting browser stream`);
    await this.browserStream.start();
    this.log.info(`===> making UI`);
    await this.makeUi.make();
    this.log.info(`===> starting static server`);
    await this.staticServer.start();
    this.log.info(`===> starting cameras services`);
    await this.cameras.start();

    this.browserStream.onOpenConnection(this.handleBrowserOpenConnection);
    this.browserStream.onCloseConnection(this.handleBrowserCloseConnection);
  }


  async destroy() {
    this.log.info(`--> closing ffmpeg RTMP streams`);
    this.cameras.destroy();
    this.log.info(`--> closing browser stream`);
    this.browserStream.destroy();
    this.log.info(`--> stopping static server`);
    await this.staticServer.destroy();
  }


  private handleBrowserOpenConnection = async (streamPath: string) => {
    const camName: string = splitLastElement(streamPath, '/')[0];

    this.log.info(`===> Starting ffmpeg's RTMP stream for camera "${camName}"`);

    // don't run if it has been started previously
    if (this.cameras.isRtmpStreamRunning(camName)) return;

    try {
      await this.cameras.startRtmpStream(camName);
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

      this.cameras.stopRtmpCamServer(camName);
    });
  }

}
