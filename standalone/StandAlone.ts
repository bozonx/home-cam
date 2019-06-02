import BrowserStream from '../webStream/BrowserStream';
import Logger from '../lib/interfaces/Logger';
import LogLevel, {LOG_LEVELS} from '../lib/interfaces/LogLevel';
import StaticServer from './StaticServer';
import MakeUi from '../ui/MakeUi';
import WebStreamController from '../webStream/WebStreamController';
import Context from '../lib/context/Context';
import {listenDestroySignals} from '../lib/helpers/helpers';
import ThumbController from '../thumb/ThumbController';


export default class StandAlone {
  private readonly context: Context;
  private readonly makeUi: MakeUi;
  // TODO: почему не внутри контроллера ???
  private readonly browserStream: BrowserStream;
  private readonly staticServer: StaticServer;
  private readonly webStreamController: WebStreamController;
  private readonly thumbController: ThumbController;


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
    this.thumbController = new ThumbController(this.context);
    this.makeUi = new MakeUi(this.context);
    this.webStreamController = new WebStreamController(this.context, this.browserStream);
  }


  async start() {
    await this.context.config.make();

    listenDestroySignals(this.context.systemConfig.config.destroyTimeoutSec, this.destroy);

    this.context.log.info(`===> starting browser stream`);
    await this.browserStream.start();
    this.context.log.info(`===> making UI`);
    await this.makeUi.make();
    this.context.log.info(`===> starting static server`);
    await this.staticServer.start();

    this.context.log.info(`===> starting web stream`);
    await this.webStreamController.start();
    this.browserStream.onOpenConnection(this.webStreamController.handleStreamOpenConnection);
    this.browserStream.onCloseConnection(this.webStreamController.handleStreamCloseConnection);
    this.staticServer.onRequest(this.thumbController.handleStaticRequest);
  }


  private destroy = async () => {
    this.context.log.info(`--> closing web stream controller`);
    this.webStreamController.destroy();
    this.context.log.info(`--> closing thumb controller`);
    this.thumbController.destroy();
    this.context.log.info(`--> closing browser stream`);
    this.browserStream.destroy();
    this.context.log.info(`--> stopping static server`);
    await this.staticServer.destroy();
  }

}
