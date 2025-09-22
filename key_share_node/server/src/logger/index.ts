import winston from "winston";
import "winston-daily-rotate-file";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function createLogger() {
  const { combine, timestamp, json, printf, colorize, splat } = winston.format;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const log_path = path.resolve(__dirname, "../../log_data/");
  console.log("Creating logger, log_path: %s", log_path);

  const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: "ksnode-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "7d",
    dirname: log_path,
    format: combine(
      timestamp(),
      splat(),
      printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      }),
    ),
  });

  const consoleTransport = new winston.transports.Console({
    level: "debug",
    format: combine(
      colorize(),
      splat(),
      printf((info) => `${info.level}: ${info.message}`),
    ),
  });

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    // format: combine(timestamp(), json()),
    transports: [consoleTransport, fileRotateTransport],
  });

  return logger;
}

export const logger = createLogger();
