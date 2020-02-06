const router = require('express').Router();
const RecipeController = require('../controllers/recipeController.js');

router.get('/', async (req, res) => {
    // will probably make an orm class that can handle the object mapping to move it out of the controller
    const recipeController = new RecipeController();
    const recipes = await recipeController.getAllRecipes();
    return res.json(recipes);
});

router.get('/search', async (req, res) => {
    const query = req.query.q;
    const recipeController = new RecipeController();
    const recipes = await recipeController.searchRecipes(query);
    return res.json(recipes);
});

router.get('/:slug', async (req, res) => {
    // will probably make an orm class that can handle the object mapping to move it out of the controller
    const recipeController = new RecipeController();
    const recipe = await recipeController.getRecipeBySlug(req.params.slug);
    return res.json(recipe);
});

module.exports = router;