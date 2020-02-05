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
        new transports.File(options.file)
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    }
};

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console(options.console));
}

module.exports = logger;