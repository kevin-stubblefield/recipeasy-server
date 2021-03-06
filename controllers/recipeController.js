const DAO = require('../db/dao.js');
const Recipes = require('../db/recipeRepository.js');
const IngredientGroups = require('../db/ingredientGroupRepository.js');
const Ingredients = require('../db/ingredientRepository');
const Instructions = require('../db/instructionRepository');
const NutritionInfo = require('../db/nutritionRepository');

const logger = require('../config/winston.js');
const { dbPath } = require('../config');

const filename = 'recipeController.js';

class RecipeController {
    constructor() {
        this.dao = new DAO(dbPath);
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

    async getRecipeBySlug(slug) {
        logger.debug(`>>>> Entering getRecipeBySlug(slug=${slug}) [${filename}]`);

        const recipe = await this.recipeRepository.fetchBySlug(slug);
        const result = this.buildRecipeObject(recipe);

        logger.debug(`<<<< Exiting getRecipeBySlug() [${filename}]`);
        return result;
    }
    
    async searchRecipes(query, sortBy) {
        logger.debug(`>>>> Entering getRecipeById(query=${query}, sortBy=${sortBy}) [${filename}]`);

        let recipes = await this.recipeRepository.search(query);

        if (sortBy === 'ingredients') {
            recipes = recipes.sort((a, b) => {
                if (a.ingredientCount < b.ingredientCount) return -1;
                if (a.ingredientCount > b.ingredientCount) return 1;
                return 0;
            });
        }

        logger.debug(`<<<< Exiting searchRecipes() [${filename}]`);
        return recipes;
    }

    async buildRecipeObjects(recipes) {
        logger.debug(`>>>> Entering buildRecipeObjects(recipes=[${JSON.stringify(recipes[0])}...]) [${filename}]`);

        let results = [];
        for (const recipe of recipes) {
            results.push(this.buildRecipeObject(recipe));
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