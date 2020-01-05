const cheerio = require('cheerio');
const axios = require('axios');

axios.get('https://www.budgetbytes.com/category/recipes/').then((response) => {
    const $ = cheerio.load(response.data);

    const recipeUrls = $('.archive-post > a').map((index, element) => element.attribs.href).get();
    
    axios.get(recipeUrls[0]).then((response) => {
        const $$ = cheerio.load(response.data);

        const recipeName = $$('h2.wprm-recipe-name').text();
        console.log(recipeName);

        const recipeSummary = $$('.wprm-recipe-summary > span').text();
        console.log(recipeSummary);
    });
});