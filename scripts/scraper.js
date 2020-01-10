const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs').promises;
const util = require('util');

for (let i = 19; i <= 23; i++) {
    let pageUrl;
    if (i === 1) {
        pageUrl = 'https://www.budgetbytes.com/category/recipes';
    } else {
        pageUrl = `https://www.budgetbytes.com/category/recipes/page/${i}`;
    }

    console.log(pageUrl);

    axios.get(pageUrl).then((response) => {
        const $ = cheerio.load(response.data);

        const recipeUrls = $('.archive-post > a').map((index, element) => element.attribs.href).get();

        recipeUrls.filter(value => !value.includes('meal-prep') && !value.includes('how-to'))
        .forEach(url => {
            axios.get(url).then(async (response) => {
                const $$ = cheerio.load(response.data);

                const recipes = $$('div.wprm-recipe-container').map((idx, el) => {
                    const recipe = {};

                    const recipeId = $$(el).data('recipe-id');
                    // console.log(recipeId);

                    const recipeSource = 'Budget Bytes';
                    // console.log(recipeSource);

                    const recipeName = $$(el).find('h2.wprm-recipe-name').text();
                    // console.log(recipeName);

                    const recipeSummary = $$(el).find('.wprm-recipe-summary > span').text();
                    // console.log(recipeSummary);

                    const recipeAuthor = $$(el).find('.wprm-recipe-author-container > span.wprm-recipe-author').text();
                    // console.log(recipeAuthor);

                    const recipePrepTime = $$(el).find('span.wprm-recipe-prep_time-minutes').text();
                    // console.log(recipePrepTime);

                    const recipeCookTime = $$(el).find('span.wprm-recipe-cook_time-minutes').text();
                    // console.log(recipeCookTime);

                    const recipeServings = $$(el).find('span.wprm-recipe-servings').text();
                    // console.log(recipeServings);

                    const recipeServingSize = $$(el).find('span.wprm-recipe-servings-unit').text();
                    // console.log(recipeServingSize);

                    const recipeIngredientGroups = [];
                    $$(el).find('.wprm-recipe-ingredient-group').each((index, element) => {
                        const recipeIngredientGroup = {};
                        recipeIngredientGroup.heading = $$(element).children('h4').text() || null;

                        const ingredients = $$(element).find('.wprm-recipe-ingredient').map((i, elem) => {
                            const ingredient = {};
                            ingredient.amount = $$(elem).children('.wprm-recipe-ingredient-amount').text() || null;
                            ingredient.unit = $$(elem).children('.wprm-recipe-ingredient-unit').text() || null;
                            ingredient.name = $$(elem).children('.wprm-recipe-ingredient-name').text() || null;
                            return ingredient;
                        }).get();

                        recipeIngredientGroup.ingredients = ingredients;

                        recipeIngredientGroups.push(recipeIngredientGroup);
                    });
                    // console.log(recipeIngredientGroups);

                    const recipeInstructions = $$(el).find('ul.wprm-recipe-instructions > li').map((index, element) => {
                        const instruction = {};
                        instruction.step = $$(element).attr('id').slice($$(element).attr('id').length - 1);
                        instruction.description = $$(element).find('.wprm-recipe-instruction-text > span').text();
                        return instruction;
                    }).get();
                    // console.log(recipeInstructions);

                    const recipeNutrition = $$(el).find('span.wprm-nutrition-label-text-nutrition-container').map((index, element) => {
                        const nutrition = {}
                        const details = $$(element).children('span').map((i, elem) => $$(elem).text());
                        nutrition.label = details[0];
                        nutrition.value = details[1];
                        nutrition.unit = details[2];
                        return nutrition;
                    }).get();
                    
                    recipe.id = recipeId;
                    recipe.source = recipeSource;
                    recipe.name = recipeName;
                    recipe.summary = recipeSummary;
                    recipe.author = recipeAuthor;
                    recipe.prepTime = recipePrepTime;
                    recipe.cookTime = recipeCookTime;
                    recipe.servings = recipeServings;
                    recipe.servingSize = recipeServingSize;
                    recipe.ingredientGroups = recipeIngredientGroups;
                    recipe.instructions = recipeInstructions;
                    recipe.nutrition = recipeNutrition;
                    return recipe;
                }).get();
                // console.log(util.inspect(recipes, false, null, true));

                if (recipes.length > 0) {
                    let json = JSON.stringify(recipes);
                    await fs.writeFile(`recipes\\${recipes[0].name.replace(/["\\/?.,;:'\[\]{}|~`]/gi, '')}.json`, json, 'utf8');
                    console.log('file complete');
                }
            });
        });
    });
}
