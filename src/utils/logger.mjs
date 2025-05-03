import winston from 'winston';
import config from '../config/index.mjs';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    if (stack) {
      return `${timestamp} ${level}: ${message} ${metaString} ${stack}`;
    }
    return `${timestamp} ${level}: ${message} ${metaString}`;
  })
);

const transports = [];

if (config.server.env !== 'test') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );
}

transports.push(
  new winston.transports.Console({
    level: config.server.env === 'development' ? 'debug' : 'info',
    format: consoleFormat,
  })
);

const logger = winston.createLogger({
  level: config.server.env === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports,
});

export default logger;