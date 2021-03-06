class IngredientGroupRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS ingredient_groups (
            id INTEGER PRIMARY KEY,
            heading TEXT,
            recipe_id INTEGER,
            FOREIGN KEY (recipe_id)
                REFERENCES recipes(id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        )
        `;
        return await this.dao.run(sql);
    }

    async insert(ingredientGroup, recipeId) {
        return await this.dao.run(
            `
            INSERT INTO ingredient_groups 
                (heading, recipe_id)
                VALUES (?, ?)
            `,
            [ingredientGroup.heading, recipeId]
        );
    }

    async fetchByRecipeId(recipeId) {
        return await this.dao.all(
            'SELECT * FROM ingredient_groups WHERE recipe_id = ?',
            [recipeId]
        );
    }
}

module.exports = IngredientGroupRepository;