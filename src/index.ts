export function reportError(e: unknown): void {
  if (e instanceof Error) {
    console.error(e.message);
    console.error(e.stack);
  } else {
    console.error(e);
  }
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogConfig = {
  level?: LogLevel;
  channel: string;
};

export class Logger {
  private level: LogLevel;
  private channel: string;

  constructor(config: LogConfig) {
    this.level = config.level || 'info';
    this.channel = config.channel;
  }

  log(message: string): void {
    this.logl(this.level, message);
  }

  logl(level: LogLevel, message: string): void {
    if (this.shouldLog(level)) {
      console.log(`[${this.channel}] [${level.toUpperCase()}] ${message}`);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}
