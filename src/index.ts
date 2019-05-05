import * as yargs from 'yargs';

import Main from './Main';


async function start() {
  const configPath: string | undefined = yargs.argv._[0];

  if (!configPath) {
    console.error(`You have to specify a path to config`);
    process.exit(2);
  }

  const main: Main = new Main(configPath);

  await main.start();
}

start()
  .catch((err) => console.error(err));
