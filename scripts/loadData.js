const fs = require('fs').promises;
const DAO = require('../db/dao.js');
const Recipes = require('../db/recipeRepository.js');
const IngredientGroups = require('../db/ingredientGroupRepository.js');
const Ingredients = require('../db/ingredientRepository');
const Instructions = require('../db/instructionRepository');
const NutritionInfo = require('../db/nutritionRepository');

async function loadData() {
    const dao = new DAO('./database.rec');
    const recipes = new Recipes(dao);
    const ingredientGroups = new IngredientGroups(dao);
    const ingredients = new Ingredients(dao);
    const instructions = new Instructions(dao);
    const nutritionInfo = new NutritionInfo(dao);

    const filenames = await fs.readdir('./recipes');
    for (const filename of filenames) {
        const file = await fs.readFile(`./recipes/${filename}`);
        const recipeData = JSON.parse(file.toString('utf-8'));
        
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
        }

        break;
    }
}

loadData();