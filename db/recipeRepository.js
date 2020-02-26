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
            image_src TEXT,
            name TEXT,
            slug TEXT,
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

    async createSlugIndex() {
        const sql = `
            CREATE UNIQUE INDEX idx_recipes_slug
            ON recipes (slug)
        `;
        return await this.dao.run(sql);
    }

    async insert(recipe) {
        return await this.dao.run(
            `
            INSERT INTO recipes 
                (source_id, source_name, source_url, image_src, name, slug, summary, author, prep_time, cook_time, servings, serving_size)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                recipe.id, recipe.source, recipe.sourceUrl, recipe.imageSrc, recipe.name, recipe.slug, recipe.summary, recipe.author, recipe.prepTime,
                recipe.cookTime, recipe.servings, recipe.servingSize
            ]
        );
    }

    async fetchAll() {
        return await this.dao.all(
            `
            SELECT recipes.id, recipes.name, recipes.image_src, recipes.slug, count(*) AS ingredient_count
            FROM recipes
            JOIN ingredient_groups ON recipes.id = ingredient_groups.recipe_id
            JOIN ingredients ON ingredient_groups.id = ingredients.ingredient_group_id
            GROUP BY recipes.id, recipes.name, recipes.image_src, recipes.slug
            ORDER BY recipes.name COLLATE NOCASE
            `
        );
    }

    async fetchById(id) {
        return await this.dao.get(
            'SELECT * FROM recipes WHERE id = ?',
            [id]
        );
    }

    async fetchBySlug(slug) {
        return await this.dao.get(
            'SELECT * FROM recipes WHERE slug = ?',
            [slug]
        );
    }

    async search(query) {
        return await this.dao.all(
            `
            SELECT recipes.id, recipes.name, recipes.image_src, recipes.slug, count(*) AS ingredient_count
            FROM recipes
            JOIN ingredient_groups ON recipes.id = ingredient_groups.recipe_id
            JOIN ingredients ON ingredient_groups.id = ingredients.ingredient_group_id
            WHERE recipes.id IN (
                SELECT r.id FROM recipes r
                JOIN ingredient_groups ig ON r.id = ig.recipe_id
                JOIN ingredients i ON ig.id = i.ingredient_group_id
                WHERE i.name LIKE ? OR r.name LIKE ?
            )
            GROUP BY recipes.id, recipes.name, recipes.image_src, recipes.slug
            ORDER BY recipes.name COLLATE NOCASE
            `,
            ['%' + query + '%', '%' + query + '%']
        );
    }
}

module.exports = RecipeRepository;