enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log("DEBUG", message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      this.log("INFO", message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARNING) {
      this.log("WARNING", message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      this.log("ERROR", message, ...args);
    }
  }

  private log(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const formattedArgs =
      args.length > 0
        ? args
            .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
            .join(" ")
        : "";

    const logMessage =
      `[${timestamp}] [${level}] ${message} ${formattedArgs}`.trim();

    switch (level) {
      case "DEBUG":
        console.debug(logMessage);
      case "INFO":
        console.info(logMessage);
      case "WARNING":
        console.warn(logMessage);
      case "ERROR":
        console.error(logMessage);
      default:
        console.log(logMessage);
    }
  }
}

export const logger = new Logger(
  process.env.LOG_LEVEL === "DEBUG" ? LogLevel.DEBUG : LogLevel.INFO
);

export { LogLevel };
