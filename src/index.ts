import BrowserStream from './BrowserStream';


function start() {
  const streamingServer: BrowserStream = new BrowserStream();

  streamingServer.start();
}

start();
