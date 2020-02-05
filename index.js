const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();
const recipeRoutes = require('./routes/recipes.js');
const logger = require('./config/winston.js');

const filename = 'index.js';

const PORT = process.env.port || 3000;

app.set('view engine', 'ejs');

app.use(cors());
app.use(helmet());
app.use(morgan(
    ':remote-addr :method :url HTTP/:http-version :status :res[content-length]B - :response-time ms',
    { stream: logger.stream }
));

app.use('/', recipeRoutes);

app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT} [${filename}]`);
});