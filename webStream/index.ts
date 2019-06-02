import * as yargs from 'yargs';

import StandAlone from '../StandAlone';
import LogLevel, {LOG_LEVELS} from '../lib/interfaces/LogLevel';
import ConsoleLogger from '../lib/context/ConsoleLogger';


async function start() {
  const configPath: string | undefined = yargs.argv._[0];
  const workDir: string | undefined = yargs.argv.workDir as any;
  const logLevel: LogLevel | undefined = yargs.argv.logLevel as any;

  if (!configPath) {
    console.error(`ERROR: You have to specify a path to config`);
    process.exit(2);
  }

  if (logLevel && !LOG_LEVELS.includes(logLevel)) {
    console.error(`ERROR: incorrect log level "${logLevel}". Allowed are only: "${JSON.stringify(LOG_LEVELS)}"`);
    process.exit(2);
  }

  const main: StandAlone = new StandAlone(configPath, ConsoleLogger, workDir, logLevel);

  await main.start();
}

start()
  .catch((err) => console.error(err));
