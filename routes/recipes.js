const router = require('express').Router();
const RecipeController = require('../controllers/recipeController.js');

router.get('/', async (req, res) => {
    // will probably make an orm class that can handle the object mapping to move it out of the controller
    const recipeController = new RecipeController();
    const recipes = await recipeController.getAllRecipes();
    // console.log(recipes);
    // return res.render('pages/index', { title: 'Recipe Catalog', recipes: recipes });
    return res.json(recipes);
});

router.get('/search', async (req, res) => {
    const query = req.query.q;
    const recipeController = new RecipeController();
    const recipes = await recipeController.searchRecipes(query);
    return res.render('pages/index', { title: query + ' - Recipe Catalog', recipes: recipes });
});

router.get('/:id', async (req, res) => {
    // will probably make an orm class that can handle the object mapping to move it out of the controller
    const recipeController = new RecipeController();
    const recipe = await recipeController.getRecipeById(req.params.id);
    // console.log(recipe);
    return res.render('pages/recipe', { title: recipe.name, recipe: recipe });
});

module.exports = router;