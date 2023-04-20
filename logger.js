const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
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
  ],
});

module.exports.logger = logger;
