import pino from "pino";
import colors from "colors";
import { config } from "../config/config.js";

class Logger {
  constructor() {
    this.logger = pino({
      level: config.logLevel,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          colorizeObjects: true,
          ignore: "pid,hostname",
          customColors: "debug:green,info:white,warn:magenta,error:red",
        },
      },
    });
  }

  debug(message) {
    this.logger.debug(colors.green(message));
  }
  info(message) {
    this.logger.info(colors.white(message));
  }
  warn(message) {
    this.logger.warn(colors.magenta(message));
  }
  error(message) {
    this.logger.error(colors.red(message));
  }
}

export const logger = new Logger();
