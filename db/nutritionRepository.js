class NutritionRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS nutrition_info (
            id INTEGER PRIMARY KEY,
            label TEXT,
            value TEXT,
            unit TEXT,
            recipe_id INTEGER,
            FOREIGN KEY (recipe_id)
                REFERENCES recipes(id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        )
        `;
        return await this.dao.run(sql);
    }

    async insert(nutrition, recipeId) {
        return this.dao.run(
            `
            INSERT INTO nutrition_info
                (label, value, unit, recipe_id)
                VALUES (?, ?, ?, ?)
            `,
            [nutrition.label, nutrition.value, nutrition.unit, recipeId]
        );
    }
}

module.exports = NutritionRepository;