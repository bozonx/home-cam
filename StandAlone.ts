import BrowserStream from './webStream/BrowserStream';
import {splitLastElement} from './lib/helpers/helpers';
import Logger from './lib/interfaces/Logger';
import LogLevel from './lib/interfaces/LogLevel';
import * as _ from 'lodash';
import StaticServer from './ui/StaticServer';
import MakeUi from './ui/MakeUi';
import WebStreamService from './webStream/WebStreamService';
import Context from './lib/context/Context';


export default class StandAlone {
  private readonly context: Context;
  private readonly browserStream: BrowserStream;
  private stopRtmpDebounce?: (cb: () => void) => void;
  private readonly staticServer: StaticServer;
  private readonly makeUi: MakeUi;
  private readonly cameras: WebStreamService;


  constructor(
    configPath: string,
    LoggerClass: new (logLevel: LogLevel) => Logger,
    workDir?: string,
    logLevel?: LogLevel
  ) {
    this.context = new Context(configPath, LoggerClass, workDir, logLevel);
    this.browserStream = new BrowserStream(this.context);
    this.staticServer = new StaticServer(this.context);
    this.makeUi = new MakeUi(this.context);
    this.cameras = new WebStreamService(this.context);
  }


  async start() {
    await this.context.config.make();
    this.stopRtmpDebounce = _.debounce(
      (cb: () => void) => cb(),
      this.context.config.config.rtmpStopDelaySec * 1000
    );

    this.context.log.info(`===> starting browser stream`);
    await this.browserStream.start();
    this.context.log.info(`===> making UI`);
    await this.makeUi.make();
    this.context.log.info(`===> starting static server`);
    await this.staticServer.start();
    this.context.log.info(`===> starting cameras services`);
    await this.cameras.start();

    this.browserStream.onOpenConnection(this.handleBrowserOpenConnection);
    this.browserStream.onCloseConnection(this.handleBrowserCloseConnection);
  }


  async destroy() {
    this.context.log.info(`--> closing ffmpeg RTMP streams`);
    this.cameras.destroy();
    this.context.log.info(`--> closing browser stream`);
    this.browserStream.destroy();
    this.context.log.info(`--> stopping static server`);
    await this.staticServer.destroy();
  }


  private handleBrowserOpenConnection = async (streamPath: string) => {
    const camName: string = splitLastElement(streamPath, '/')[0];

    this.context.log.info(`===> Starting ffmpeg's RTMP stream for camera "${camName}"`);

    // don't run if it has been started previously
    if (this.cameras.isRtmpStreamRunning(camName)) return;

    try {
      await this.cameras.startRtmpStream(camName);
    }
    catch (err) {
      this.context.log.error(err);
    }
  }

  private handleBrowserCloseConnection = (streamPath: string) => {
    // don't stop if some else is connected
    if (this.browserStream.hasAnyConnected(streamPath)) return;

    const camName: string = splitLastElement(streamPath, '/')[0];

    this.stopRtmpDebounce && this.stopRtmpDebounce(() => {
      // don't stop if someone ans been connected while it waits
      if (this.browserStream.hasAnyConnected(streamPath)) return;

      this.context.log.info(`===> Stopping ffmpeg's rtmp stream for camera "${camName}"`);

      this.cameras.stopRtmpCamServer(camName);
    });
  }

}
