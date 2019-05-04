import StreamingServer from './StreamingServer';


function start() {
  const streamingServer: StreamingServer = new StreamingServer();

  streamingServer.start();
}

start();
