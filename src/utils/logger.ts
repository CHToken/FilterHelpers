import winston from 'winston';
import fs from 'fs';

// ✅ Ensure `logs` directory exists (avoids errors)
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

// ✅ Fast JSON Format (No Colors, Best for Files)
const fastJsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json() // ✅ JSON format for best performance in file logs
);

// ✅ Pretty Console Format (Colorized for Readability)
const prettyConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }), // 🎨 Enables colors
  winston.format.timestamp({ format: 'HH:mm:ss:SSS' }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}] ${message}`;
  })
);

// ✅ Non-blocking file streams
const createLogStream = (filename: string) => {
  return fs.createWriteStream(filename, {
    flags: 'a', // ✅ Append mode (non-blocking)
    highWaterMark: 1024 * 1024, // ✅ Buffer 1MB before writing
  });
};

// ✅ Define Winston Logger (Optimized for Production)
const logger = winston.createLogger({
  level: 'debug', // ✅ Accept everything down to debug
  transports: [
    new winston.transports.Console({
      level: 'debug', // Console shows debug, info, warn, error
      format: prettyConsoleFormat,
    }),

    new winston.transports.Stream({
      stream: createLogStream('logs/info.log'),
      level: 'info', // Only info+ to info.log
      format: fastJsonFormat,
    }),

    new winston.transports.Stream({
      stream: createLogStream('logs/error.log'),
      level: 'warn', // Only warn+ to error.log
      format: fastJsonFormat,
    }),

    // new winston.transports.Stream({
    //   stream: createLogStream('logs/debug.log'),
    //   level: 'debug', // Only debug+ to debug.log
    //   format: fastJsonFormat,
    // }),
  ],
});

export { logger };
