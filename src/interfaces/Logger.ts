import LogLevel from './LogLevel';


export default interface Logger {
  logLevel: LogLevel;
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}
