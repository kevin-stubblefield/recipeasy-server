const fs = require('fs').promises;
const path = require('path');
const DAO = require('../db/dao.js');
const Recipes = require('../db/recipeRepository.js');
const IngredientGroups = require('../db/ingredientGroupRepository.js');
const Ingredients = require('../db/ingredientRepository');
const Instructions = require('../db/instructionRepository');
const NutritionInfo = require('../db/nutritionRepository');

const cliProgress = require('cli-progress');

async function loadRecipesToDb() {
    const dao = new DAO('./database.rec');
    const recipes = new Recipes(dao);
    const ingredientGroups = new IngredientGroups(dao);
    const ingredients = new Ingredients(dao);
    const instructions = new Instructions(dao);
    const nutritionInfo = new NutritionInfo(dao);

    const file = await fs.readFile(path.join(__dirname, '..', 'budgetBytes.json'));
    const recipeData = JSON.parse(file.toString('utf-8'));
    const bar = new cliProgress.SingleBar({
        format: 'ETL Progress |{bar}| {percentage}% | {value}/{total} Files Processed | {duration}s',
        hideCursor: true
    }, cliProgress.Presets.shades_classic);
    bar.start(recipeData.length, 0);

    // use a transcation for bulk insert
    dao.beginTransaction();
    for (const recipe of recipeData) {
        const data = await recipes.insert(recipe);
        const recipeId = data.id;

        for (const group of recipe.ingredientGroups) {
            const groupData = await ingredientGroups.insert(group, recipeId);

            for (const ingredient of group.ingredients) {
                await ingredients.insert(ingredient, groupData.id);
            }
        }

        for (const instruction of recipe.instructions) {
            await instructions.insert(instruction, recipeId);
        }

        for (const nutrition of recipe.nutrition) {
            await nutritionInfo.insert(nutrition, recipeId);
        }
        
        bar.increment();
    }

    dao.commit();

    bar.stop();
}

loadRecipesToDb();