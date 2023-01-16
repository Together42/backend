"use strict";

import winston, { createLogger, format, transports } from "winston";
import winstonDaily from "winston-daily-rotate-file";
const { combine, timestamp, printf } = format;

const customFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    customFormat,
  ),
  transports: [
    new winston.transports.Console(),

    new winstonDaily({
      level: "info",
      datePattern: "YYYYMMDD",
      dirname: "./logs",
      filename: "together_%DATE%.log",
      maxSize: null,
      maxFiles: 14,
    }),
  ],
});

const stream = {
  write: message => {
    logger.info(message);
  },
};

export { logger, stream };