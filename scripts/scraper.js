const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs').promises;
const cliProgress = require('cli-progress');
const slugify = require('./slugify.js');
const logger = require('../config/winston.js');
const util = require('util');

const filename = 'scraper.js';

async function scrapeData() {
    for (let i = 1; i <= 23; i++) {
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

        let recipeUrls;
        try {
            recipeUrls = await fetchRecipeUrls(pageUrl);
        } catch(e) {
            logger.error(`Unable to get recipe urls from ${pageUrl} [${filename}]`);
            logger.error(e);
        }

        bar.start(recipeUrls.length, 0);

        let usablePagesCount = 0;
        
        for (const url of recipeUrls) {
            let recipes;
            try {
                recipes = await fetchRecipesOnPage(url);
            } catch (e) {
                logger.error(`Unable to get recipes on page ${url.href} [${filename}]`);
                logger.error(e);
            }
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
    let response;
    try {
        response = await axios.get(pageUrl);
    } catch (e) {
        logger.error(`Unable to get page ${pageUrl} [${filename}]`);
        logger.error(e);
    }
    const $ = cheerio.load(response.data);

    return $('.archive-post > a').map((index, element) => {
        const href = element.attribs.href;
        const imageSrc = $(element).find('img').data('lazy-src');
        return {
            href,
            imageSrc
        }
    }).get();
}

async function fetchRecipesOnPage(url) {
    let response;
    try {
        response = await axios.get(url.href);
    } catch(e) {
        logger.error(`Unable to get url ${url.href} [${filename}]`);
        logger.error(e);
    }
    const $ = cheerio.load(response.data);

    const recipes = $('div.wprm-recipe-container').map((idx, el) => {
        const recipe = {};

        const recipeId = $(el).data('recipe-id');
        // console.log(recipeId);

        const recipeSource = 'Budget Bytes';
        // console.log(recipeSource);

        const recipeSourceUrl = url.href;
        
        const recipeImageSrc = url.imageSrc;

        const recipeName = $(el).find('h2.wprm-recipe-name').text().replace('&', 'and');
        // console.log(recipeName);

        const recipeSlug = slugify(recipeName.replace(/["\\\/?.,;:'\[\]{}\(\)|~`]/gi, ''));
        // console.log(recipeSlug);

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
        recipe.sourceUrl = recipeSourceUrl;
        recipe.imageSrc = recipeImageSrc;
        recipe.name = recipeName;
        recipe.slug = recipeSlug;
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

    return recipes;
}

async function writeFile(recipes) {
    let json = JSON.stringify(recipes);
    try {
        await fs.writeFile(`recipes\\${recipes[0].slug}.json`, json, 'utf8');
    } catch (e) {
        logger.error(`Error writing file [${filename}]`);
        logger.error(e);
    }
}

scrapeData();