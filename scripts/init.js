const DAO = require('../db/dao.js');
const Recipes = require('../db/recipeRepository.js');
const IngredientGroups = require('../db/ingredientGroupRepository.js');
const Ingredients = require('../db/ingredientRepository');
const Instructions = require('../db/instructionRepository');
const NutritionInfo = require('../db/nutritionRepository');

async function init() {
    const dao = new DAO('../database.rec');
    const recipes = new Recipes(dao);
    const ingredientGroups = new IngredientGroups(dao);
    const ingredients = new Ingredients(dao);
    const instructions = new Instructions(dao);
    const nutritionInfo = new NutritionInfo(dao);

    await recipes.createTable();
    await ingredientGroups.createTable();
    await ingredients.createTable();
    await instructions.createTable();
    await nutritionInfo.createTable();
}

init();