const cheerio = require('cheerio');
const axios = require('axios');

axios.get('https://www.budgetbytes.com/category/recipes/').then((response) => {
    const $ = cheerio.load(response.data);

    const recipeUrls = $('.archive-post > a').map((index, element) => element.attribs.href).get();
    
    axios.get(recipeUrls[1]).then((response) => {
        const $$ = cheerio.load(response.data);

        const recipeSource = 'Budget Bytes';
        console.log(recipeSource);

        const recipeName = $$('h2.wprm-recipe-name').text();
        console.log(recipeName);

        const recipeSummary = $$('.wprm-recipe-summary > span').text();
        console.log(recipeSummary);

        const recipeAuthor = $$('.wprm-recipe-author-container > span.wprm-recipe-author').text();
        console.log(recipeAuthor);

        const recipePrepTime = $$('span.wprm-recipe-prep_time-minutes').text();
        console.log(recipePrepTime);

        const recipeCookTime = $$('span.wprm-recipe-cook_time-minutes').text();
        console.log(recipeCookTime);

        const recipeServings = $$('span.wprm-recipe-servings').text();
        console.log(recipeServings);

        // process ingredient groups
        /* 
            recipeIngredientGroups = {
                heading: string,
                ingredients: array<ingredient>
            }

            ingredient = {
                amount: string,
                unit: string,
                name: string
            }
        */

        const recipeIngredientGroups = [];
        $$('.wprm-recipe-ingredient-group').each((index, element) => {
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
        console.log(recipeIngredientGroups);

        const recipeInstructions = $$('ul.wprm-recipe-instructions > li').map((index, element) => {
            const instruction = {};
            instruction.step = $$(element).attr('id').slice($$(element).attr('id').length - 1);
            instruction.description = $$(element).find('.wprm-recipe-instruction-text > span').text();
            return instruction;
        }).get();
        console.log(recipeInstructions);

        const recipeNutrition = $$('span.wprm-nutrition-label-text-nutrition-container').map((index, element) => {
            const nutrition = {}
            const details = $$(element).children('span').map((i, elem) => $$(elem).text());
            nutrition.label = details[0];
            nutrition.value = details[1];
            nutrition.unit = details[2];
            return nutrition;
        }).get();
        console.log(recipeNutrition);
    });
});