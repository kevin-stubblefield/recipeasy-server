const router = require('express').Router();
const RecipeController = require('../controllers/recipeController.js');

router.get('/', async (req, res) => {
    // will probably make an orm class that can handle the object mapping to move it out of the controller
    const recipeController = new RecipeController();
    const recipes = await recipeController.getAllRecipes();
    return res.render('pages/index', { title: 'Index', recipes });
});

router.get('/search', async (req, res) => {
    const query = req.query.q;
    const sortBy = req.query.sort;
    const recipeController = new RecipeController();
    const recipes = await recipeController.searchRecipes(query, sortBy);
    return res.render('pages/index', { title: query, recipes });
});

router.get('/:slug', async (req, res) => {
    // will probably make an orm class that can handle the object mapping to move it out of the controller
    const recipeController = new RecipeController();
    const recipe = await recipeController.getRecipeBySlug(req.params.slug);
    return res.render('pages/recipe', { title: recipe.name, recipe });
});

module.exports = router;