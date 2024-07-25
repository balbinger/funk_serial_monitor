const winston = require('winston');
const { combine, timestamp, json } = winston.format;
const moment = require('moment-timezone');
require('winston-daily-rotate-file');

const timezone = () => {
  return moment(new Date())
    .tz('Europe/Berlin')
    .format('YYYY-MM-DDTHH:mm:ss.SSS');
};

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp({ format: timezone }), json()),
  defaultMeta: { service: 'funk_serial_monitor' },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: './log/error.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '40m',
      maxFiles: 30,
    }),
    new winston.transports.DailyRotateFile({
      filename: './log/combined.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '40m',
      maxFiles: 30,
    }),
    new winston.transports.Stream({
      stream: process.stderr,
      level: 'debug',
    }),
  ],
});

module.exports.logger = logger;
