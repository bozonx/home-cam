const StaticSrv = require('static-server');

import Main from '../webStream/Main';


export default class StaticServer {
  private readonly main: Main;
  private readonly server: typeof StaticSrv;


  constructor(main: Main) {
    this.main = main;

    this.server = new StaticSrv({
      // TODO: add
      rootPath: '.',            // required, the root of the server file tree
      // TODO: add
      port: 1337,               // required, the port to listen
      //name: 'my-http-server',   // optional, will set "X-Powered-by" HTTP header
      // TODO: add
      host: '10.0.0.100',       // optional, defaults to any interface
      cors: '*',                // optional, defaults to undefined
      //followSymlink: true,      // optional, defaults to a 404 error
      // templates: {
      //   index: 'foo.html',      // optional, defaults to 'index.html'
      //   notFound: '404.html'    // optional, defaults to undefined
      // }
    });
  }

  destroy() {
    // TODO: add
  }


  start() {
    // this.server.start(function () {
    //   console.log('Server listening to', server.port);
    // });
  }


}
