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
                (source_id, source_name, name, summary, author, prep_time, cook_time, servings, serving_size)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                recipe.id, recipe.source, recipe.name, recipe.summary, recipe.author, recipe.prepTime,
                recipe.cookTime, recipe.servings, recipe.servingSize
            ]
        );
    }
}

module.exports = RecipeRepository;