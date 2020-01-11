const sqlite3 = require('sqlite3');

class DAO {
    constructor(filepath) {
        this.db = new sqlite3.Database(filepath, (err) => {
            if (err) {
                console.log('Could not connect to database', err);
            } else {
                console.log('Connected to database');
            }
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.log('Error running sql ' + sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    serialize(callback) {
        this.db.serialize(callback);
    }

    beginTransaction() {
        return new Promise((resolve, reject) => {
            this.db.run('begin transaction', function(err) {
                if (err) {
                    console.log('Error running sql ' + sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    commit() {
        return new Promise((resolve, reject) => {
            this.db.run('commit', function(err) {
                if (err) {
                    console.log('Error running sql ' + sql);
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = DAO;