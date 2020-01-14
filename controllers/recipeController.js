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
        const recipes = await this.recipeRepository.fetchAll();
        return recipes;
    }

    async getRecipeById(id) {
        const recipe = await this.recipeRepository.fetchById(id);
        const result = this.buildRecipeObject(recipe);
        return result;
    }

    async buildRecipeObjects(recipes) {
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
        return results;
    }

    async buildRecipeObject(recipe) {
        recipe.ingredientGroups = await this.ingredientGroupsRepository.fetchByRecipeId(recipe.id);
        const ingredientGroupIds = recipe.ingredientGroups.map((ingredientGroup) => ingredientGroup.id);
        const ingredients = await this.ingredientsRepository.fetchByIngredientGroupIds(ingredientGroupIds);
        for (const ingredientGroup of recipe.ingredientGroups) {
            ingredientGroup.ingredients = ingredients.filter((ingredient) => ingredient.ingredientGroupId === ingredientGroup.id);
        }
        recipe.instructions = await this.instructionsRepository.fetchByRecipeId(recipe.id);
        recipe.nutritionInfo = await this.nutritionInfoRepository.fetchByRecipeId(recipe.id);
        return recipe;
    }
}

module.exports = RecipeController;