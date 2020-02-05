const DAO = require('../db/dao.js');
const Recipes = require('../db/recipeRepository.js');
const IngredientGroups = require('../db/ingredientGroupRepository.js');
const Ingredients = require('../db/ingredientRepository');
const Instructions = require('../db/instructionRepository');
const NutritionInfo = require('../db/nutritionRepository');

const logger = require('../config/winston.js');

const filename = 'recipeController.js';

class RecipeController {
    constructor() {
        this.dao = new DAO('./database.rec');
        this.recipeRepository = new Recipes(this.dao);
        this.ingredientGroupsRepository = new IngredientGroups(this.dao);
        this.ingredientsRepository = new Ingredients(this.dao);
        this.instructionsRepository = new Instructions(this.dao);
        this.nutritionInfoRepository = new NutritionInfo(this.dao);
    }

    async getAllRecipes() {
        logger.debug(`>>>> Entering getAllRecipes() [${filename}]`);

        const recipes = await this.recipeRepository.fetchAll();

        logger.debug(`<<<< Exiting getAllRecipes [${filename}]`);
        return recipes;
    }

    async getRecipeById(id) {
        logger.debug(`>>>> Entering getRecipeById(id=${id}) [${filename}]`);

        const recipe = await this.recipeRepository.fetchById(id);
        const result = this.buildRecipeObject(recipe);

        logger.debug(`<<<< Exiting getRecipeById() [${filename}]`);
        return result;
    }
    
    async searchRecipes(query) {
        logger.debug(`>>>> Entering getRecipeById(query=${query}) [${filename}]`);

        const recipes = await this.recipeRepository.search(query);

        logger.debug(`<<<< Exiting searchRecipes() [${filename}]`);
        return recipes;
    }

    async buildRecipeObjects(recipes) {
        logger.debug(`>>>> Entering buildRecipeObjects(recipes=[${JSON.stringify(recipes[0])}...]) [${filename}]`);

        let results = [];
        for (const recipe of recipes) {
            recipe.ingredientGroups = await this.ingredientGroupsRepository.fetchByRecipeId(recipe.id);
            const ingredientGroupIds = recipe.ingredientGroups.map((ingredientGroup) => ingredientGroup.id);
            const ingredients = await this.ingredientsRepository.fetchByIngredientGroupIds(ingredientGroupIds);
            for (const ingredientGroup of recipe.ingredientGroups) {
                ingredientGroup.ingredients = ingredients.filter((ingredient) => ingredient.ingredientGroupId === ingredientGroup.id);
            }
            recipe.instructions = await this.instructionsRepository.fetchByRecipeId(recipe.id);
            recipe.nutritionInfo = await this.nutritionInfoRepository.fetchByRecipeId(recipe.id);
            results.push(recipe);
        }

        logger.debug(`<<<< Exiting buildRecipeObjects() [${filename}]`);
        return results;
    }

    async buildRecipeObject(recipe) {
        logger.debug(`>>>> Entering buildRecipeObject(recipe=${JSON.stringify(recipe)}) [${filename}]`);

        recipe.ingredientGroups = await this.ingredientGroupsRepository.fetchByRecipeId(recipe.id);
        const ingredientGroupIds = recipe.ingredientGroups.map((ingredientGroup) => ingredientGroup.id);
        const ingredients = await this.ingredientsRepository.fetchByIngredientGroupIds(ingredientGroupIds);
        for (const ingredientGroup of recipe.ingredientGroups) {
            ingredientGroup.ingredients = ingredients.filter((ingredient) => ingredient.ingredientGroupId === ingredientGroup.id);
        }
        recipe.instructions = await this.instructionsRepository.fetchByRecipeId(recipe.id);
        recipe.nutritionInfo = await this.nutritionInfoRepository.fetchByRecipeId(recipe.id);

        logger.debug(`<<<< Exiting buildRecipeObject() [${filename}]`);
        return recipe;
    }
}

module.exports = RecipeController;