"use strict";

import winston, { format } from "winston";
import winstonDaily from "winston-daily-rotate-file";
const { combine, timestamp, printf } = format;

const logDir = "logs"; // Save the log files in 'logs' directory which below directory of the project.
const customFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

const logger = winston.createLogger({
  level: "debug",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    customFormat,
  ),
  transports: [
    // File settings for the info level logs.
    new winstonDaily({
      level: "info",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30, // Save log files until 30 days
      zippedArchive: true,
    }),
    // File settings for the error level logs
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error", // 'error.log' files stored under '/logs/error'
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});

const stream = {
  write: (message) => {
    logger.info(message);
  },
};

// Check whole logs
logger.add(
  new winston.transports.Console({
    level: "debug",
    format: winston.format.combine(
      winston.format.colorize(), // Print log as colorize
      winston.format.simple(), // Print log formatting as like `${info.level}: ${info.message} JSON.stringify({ ...rest })`
    ),
  }),
);
export { logger, stream };
