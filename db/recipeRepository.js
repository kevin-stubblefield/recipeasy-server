class RecipeRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY,
            source_id INTEGER,
            source_name TEXT,
            source_url TEXT,
            name TEXT,
            summary TEXT,
            author TEXT,
            prep_time TEXT,
            cook_time TEXT,
            servings TEXT,
            serving_size TEXT
        )
        `;
        return await this.dao.run(sql);
    }

    async insert(recipe) {
        return await this.dao.run(
            `
            INSERT INTO recipes 
                (source_id, source_name, source_url, name, summary, author, prep_time, cook_time, servings, serving_size)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                recipe.id, recipe.source, recipe.sourceUrl, recipe.name, recipe.summary, recipe.author, recipe.prepTime,
                recipe.cookTime, recipe.servings, recipe.servingSize
            ]
        );
    }

    async fetchAll() {
        return await this.dao.all(
            `
            SELECT recipes.id, recipes.name, count(*) AS ingredient_count
            FROM recipes
            JOIN ingredient_groups ON recipes.id = ingredient_groups.recipe_id
            JOIN ingredients ON ingredient_groups.id = ingredients.ingredient_group_id
            GROUP BY recipes.id, recipes.name
            ORDER BY recipes.name
            `
        );
    }

    async fetchById(id) {
        return await this.dao.get(
            'SELECT * FROM recipes WHERE id = ?',
            [id]
        );
    }

    async search(query) {
        return await this.dao.all(
            `
            SELECT recipes.id, recipes.name, count(*) AS ingredient_count
            FROM recipes
            JOIN ingredient_groups ON recipes.id = ingredient_groups.recipe_id
            JOIN ingredients ON ingredient_groups.id = ingredients.ingredient_group_id
            WHERE recipes.id IN (
                SELECT r.id FROM recipes r
                JOIN ingredient_groups ig ON r.id = ig.recipe_id
                JOIN ingredients i ON ig.id = i.ingredient_group_id
                WHERE i.name LIKE ? OR r.name LIKE ?
            )
            GROUP BY recipes.id, recipes.name
            ORDER BY recipes.name
            `,
            ['%' + query + '%', '%' + query + '%']
        );
    }
}

module.exports = RecipeRepository;