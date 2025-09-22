import winston from "winston";
import "winston-daily-rotate-file";

export function createLogger() {
  const { combine, timestamp, json } = winston.format;

  const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: "combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
  });

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), json()),
    transports: [fileRotateTransport],
  });
}
