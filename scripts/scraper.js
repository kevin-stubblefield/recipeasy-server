const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs').promises;
const cliProgress = require('cli-progress');
const util = require('util');

async function scrapeData() {
    for (let i = 22; i <= 23; i++) {
        const bar = new cliProgress.SingleBar({
            format: 'Recipe Progress | Page ' + i + ' |{bar}| {percentage}% | {value}/{total} Recipes | {duration}s',
            hideCursor: true
        }, cliProgress.Presets.shades_classic);

        let pageUrl;
        if (i === 1) {
            pageUrl = 'https://www.budgetbytes.com/category/recipes';
        } else {
            pageUrl = `https://www.budgetbytes.com/category/recipes/page/${i}`;
        }

        const recipeUrls = await fetchRecipeUrls(pageUrl);
        bar.start(recipeUrls.length, 0);

        let usablePagesCount = 0;
        
        for (const url of recipeUrls) {
            const recipes = await fetchRecipesOnPage(url);
            // console.log(util.inspect(recipes, false, null, true));
            if (recipes.length > 0) {
                await writeFile(recipes);
                bar.increment();
                usablePagesCount++;
            }
        }
        bar.setTotal(usablePagesCount);
        bar.stop();
    }
}

async function fetchRecipeUrls(pageUrl) {
    const response = await axios.get(pageUrl)
    const $ = cheerio.load(response.data);

    return $('.archive-post > a').map((index, element) => element.attribs.href).get();
}

async function fetchRecipesOnPage(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const recipes = $('div.wprm-recipe-container').map((idx, el) => {
        const recipe = {};

        const recipeId = $(el).data('recipe-id');
        // console.log(recipeId);

        const recipeSource = 'Budget Bytes';
        // console.log(recipeSource);

        const recipeName = $(el).find('h2.wprm-recipe-name').text();
        // console.log(recipeName);

        const recipeSummary = $(el).find('.wprm-recipe-summary > span').text();
        // console.log(recipeSummary);

        const recipeAuthor = $(el).find('.wprm-recipe-author-container > span.wprm-recipe-author').text();
        // console.log(recipeAuthor);

        const recipePrepTime = $(el).find('span.wprm-recipe-prep_time-minutes').text();
        // console.log(recipePrepTime);

        const recipeCookTime = $(el).find('span.wprm-recipe-cook_time-minutes').text();
        // console.log(recipeCookTime);

        const recipeServings = $(el).find('span.wprm-recipe-servings').text();
        // console.log(recipeServings);

        const recipeServingSize = $(el).find('span.wprm-recipe-servings-unit').text();
        // console.log(recipeServingSize);

        const recipeIngredientGroups = [];
        $(el).find('.wprm-recipe-ingredient-group').each((index, element) => {
            const recipeIngredientGroup = {};
            recipeIngredientGroup.heading = $(element).children('h4').text() || null;

            const ingredients = $(element).find('.wprm-recipe-ingredient').map((i, elem) => {
                const ingredient = {};
                ingredient.amount = $(elem).children('.wprm-recipe-ingredient-amount').text() || null;
                ingredient.unit = $(elem).children('.wprm-recipe-ingredient-unit').text() || null;
                ingredient.name = $(elem).children('.wprm-recipe-ingredient-name').text() || null;
                return ingredient;
            }).get();

            recipeIngredientGroup.ingredients = ingredients;

            recipeIngredientGroups.push(recipeIngredientGroup);
        });
        // console.log(recipeIngredientGroups);

        const recipeInstructions = $(el).find('ul.wprm-recipe-instructions > li').map((index, element) => {
            const instruction = {};
            instruction.step = $(element).attr('id').slice($(element).attr('id').length - 3);
            
            let description = $(element).find('.wprm-recipe-instruction-text > span').text();
            if (!description) {
                description = $(element).find('.wprm-recipe-instruction-text').text();
            }
            
            instruction.description = description;
            return instruction;
        }).get();
        // console.log(recipeInstructions);

        const recipeNutrition = $(el).find('span.wprm-nutrition-label-text-nutrition-container').map((index, element) => {
            const nutrition = {}
            const details = $(element).children('span').map((i, elem) => $(elem).text());
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

    // if (recipes.length > 0) {
    //     let json = JSON.stringify(recipes);
    //     await fs.writeFile(`recipes\\${recipes[0].name.replace(/["\\/?.,;:'\[\]{}|~`]/gi, '')}.json`, json, 'utf8');
    // }

    return recipes;
}

async function writeFile(recipes) {
    let json = JSON.stringify(recipes);
    try {
        await fs.writeFile(`recipes\\${recipes[0].name.replace(/["\\/?.,;:'\[\]{}|~`]/gi, '')}.json`, json, 'utf8');
    } catch (err) {
        console.log('Error writing file', err);
    }
}

scrapeData();