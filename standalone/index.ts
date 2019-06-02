import * as yargs from 'yargs';

import StandAlone from './StandAlone';
import LogLevel from '../lib/interfaces/LogLevel';
import ConsoleLogger from '../lib/context/ConsoleLogger';


async function start() {
  const configPath: string | undefined = yargs.argv._[0];
  const workDir: string | undefined = yargs.argv.workDir as any;
  const logLevel: LogLevel | undefined = yargs.argv.logLevel as any;

  const main: StandAlone = new StandAlone(ConsoleLogger, configPath, workDir, logLevel);

  await main.start();
}

start()
  .catch((err) => console.error(err));
