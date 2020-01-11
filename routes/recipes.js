const router = require('express').Router();

router.get('/', (req, res) => {
    return res.render('pages/index', { title: 'Recipe Catalog '});
});

module.exports = router;