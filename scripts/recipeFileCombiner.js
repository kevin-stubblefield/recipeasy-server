const fs = require('fs');
const path = require('path');
const logger = require('../config/winston.js');

const recipePath = path.join(__dirname, '..', 'recipes');
const dir = fs.readdirSync(recipePath);
const results = [];
for (const filename of dir) {
    const file = fs.readFileSync(path.join(recipePath, filename));
    
    results.push(...JSON.parse(file));
}

fs.writeFileSync(path.join(__dirname, '..', 'budgetBytes.json'), JSON.stringify(results));
logger.debug('budgetBytes.json written');