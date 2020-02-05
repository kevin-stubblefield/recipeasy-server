const { format, createLogger, transports } = require('winston');
const { combine, colorize, timestamp, printf, json } = format;

const logFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

const options = {
    file: {
        level: 'warn',
        filename: './logs/app.log',
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5,
        format: combine(
            timestamp(),
            json()
        ),
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: combine(
            colorize(),
            timestamp(),
            logFormat
        ),
    }
};

const logger = createLogger({
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console)
    ],
    exitOnError: false
});

module.exports = logger;