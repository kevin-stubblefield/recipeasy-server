const DAO = require('../db/dao.js');
const Recipes = require('../db/recipeRepository.js');
const IngredientGroups = require('../db/ingredientGroupRepository.js');
const Ingredients = require('../db/ingredientRepository');
const Instructions = require('../db/instructionRepository');
const NutritionInfo = require('../db/nutritionRepository');

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
        let results = [];
        this.dao.beginTransaction();
        const recipes = await this.recipeRepository.fetchAll();
        for (const recipe of recipes) {
            recipe.ingredientGroups = await this.ingredientGroupsRepository.fetchByRecipeId(recipe.id);
            for (const ingredientGroup of recipe.ingredientGroups) {
                recipe.ingredientGroups.ingredients = await this.ingredientsRepository.fetchByIngredientGroupId(ingredientGroup.id);
            }
            recipe.instructions = await this.instructionsRepository.fetchByRecipeId(recipe.id);
            recipe.nutritionInfo = await this.nutritionInfoRepository.fetchByRecipeId(recipe.id);
            results.push(recipe);
        }
        this.dao.commit();
        return results;
    }
}

module.exports = RecipeController;