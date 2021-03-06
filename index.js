const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const recipeRoutes = require('./routes/recipes.js');
const logger = require('./config/winston.js');
const { port } = require('./config');

const filename = 'index.js';

app.set('trust proxy', true);
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(cors());
app.use(helmet());
app.use(morgan(
    ':remote-addr :method :url HTTP/:http-version :status :res[content-length]B - :response-time ms',
    { stream: logger.stream }
));

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use('/', recipeRoutes);

app.listen(port, () => {
    logger.info(`Server listening on port ${port} [${filename}]`);
});