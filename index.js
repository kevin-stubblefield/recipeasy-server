const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const recipeRoutes = require('./routes/recipes.js');
const logger = require('./config/winston.js');

const filename = 'index.js';

const PORT = process.env.port || 3000;

app.set('view engine', 'ejs');

app.use(cors());
app.use(helmet());

app.use('/', recipeRoutes);

app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT} [${filename}]`);
});