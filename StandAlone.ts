import BrowserStream from './webStream/BrowserStream';
import Logger from './lib/interfaces/Logger';
import LogLevel, {LOG_LEVELS} from './lib/interfaces/LogLevel';
import StaticServer from './ui/StaticServer';
import MakeUi from './ui/MakeUi';
import WebStreamController from './webStream/WebStreamController';
import Context from './lib/context/Context';


export default class StandAlone {
  private readonly context: Context;
  private readonly browserStream: BrowserStream;
  private readonly staticServer: StaticServer;
  private readonly makeUi: MakeUi;
  private readonly webStreamService: WebStreamController;


  constructor(
    LoggerClass: new (logLevel: LogLevel) => Logger,
    configPath: string,
    workDir?: string,
    logLevel?: LogLevel
  ) {
    if (!configPath) {
      console.error(`ERROR: You have to specify a path to config`);
      process.exit(2);
    }

    if (logLevel && !LOG_LEVELS.includes(logLevel)) {
      console.error(`ERROR: incorrect log level "${logLevel}". Allowed are only: "${JSON.stringify(LOG_LEVELS)}"`);
      process.exit(2);
    }

    this.context = new Context(configPath, LoggerClass, workDir, logLevel);
    this.browserStream = new BrowserStream(this.context);
    this.staticServer = new StaticServer(this.context);
    this.makeUi = new MakeUi(this.context);
    this.webStreamService = new WebStreamController(this.context, this.browserStream);
  }


  async start() {
    await this.context.config.make();

    this.context.log.info(`===> starting browser stream`);
    await this.browserStream.start();
    this.context.log.info(`===> making UI`);
    await this.makeUi.make();
    this.context.log.info(`===> starting static server`);
    await this.staticServer.start();

    this.browserStream.onOpenConnection(this.webStreamService.handleStreamOpenConnection);
    this.browserStream.onCloseConnection(this.webStreamService.handleStreamCloseConnection);
  }

  async destroy() {
    this.context.log.info(`--> closing ffmpeg RTMP streams`);
    this.webStreamService.destroy();
    this.context.log.info(`--> closing browser stream`);
    this.browserStream.destroy();
    this.context.log.info(`--> stopping static server`);
    await this.staticServer.destroy();
  }

}
