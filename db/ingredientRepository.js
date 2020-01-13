class IngredientRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY,
            amount TEXT,
            unit TEXT,
            name TEXT,
            ingredient_group_id INTEGER,
            FOREIGN KEY (ingredient_group_id)
                REFERENCES ingredient_groups(id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        )
        `;
        return await this.dao.run(sql);
    }

    async insert(ingredient, ingredientGroupId) {
        return await this.dao.run(
            `
            INSERT INTO ingredients 
                (amount, unit, name, ingredient_group_id)
                VALUES (?, ?, ?, ?)
            `,
            [ingredient.amount, ingredient.unit, ingredient.name, ingredientGroupId]
        );
    }

    async fetchByIngredientGroupId(ingredientGroupId) {
        return await this.dao.all(
            'SELECT * FROM ingredients WHERE ingredient_group_id = ?',
            [ingredientGroupId]
        );
    }
}

module.exports = IngredientRepository;