const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();
const recipeRoutes = require('./routes/recipes.js');
const logger = require('./config/winston.js');
const { port } = require('./config');

const filename = 'index.js';

app.set('trust proxy', true);
app.set('view engine', 'ejs');

app.use(cors());
app.use(helmet());
app.use(morgan(
    ':remote-addr :method :url HTTP/:http-version :status :res[content-length]B - :response-time ms',
    { stream: logger.stream }
));

app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/', recipeRoutes);

app.listen(port, () => {
    logger.info(`Server listening on port ${port} [${filename}]`);
});