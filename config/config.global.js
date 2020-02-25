let config = {};

config.env = 'development';
config.port = process.env.PORT || 3000;
config.hostname = `localhost:${config.port}`;

config.logPath = './logs/app.log';

module.exports = config;