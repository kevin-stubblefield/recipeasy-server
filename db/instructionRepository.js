class InstructionRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS instructions (
            id INTEGER PRIMARY KEY,
            step TEXT,
            description TEXT,
            recipe_id INTEGER,
            FOREIGN KEY (recipe_id)
                REFERENCES recipes(id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        )
        `;
        return await this.dao.run(sql);
    }

    async insert(instruction, recipeId) {
        return await this.dao.run(
            `
            INSERT INTO instructions 
                (step, description, recipe_id)
                VALUES (?, ?, ?)
            `,
            [instruction.step, instruction.description, recipeId]
        );
    }

    async fetchByRecipeId(recipeId) {
        return await this.dao.all(
            'SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step',
            [recipeId]
        );
    }
}

module.exports = InstructionRepository;