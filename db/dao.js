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
                    console.log(`Error running sql: ${sql}`);
                    console.log(err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    console.log(`Error running sql: ${sql}`);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(this.toCamelCase(result));
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, results) => {
                if (err) {
                    console.log(`Error running sql: ${sql}`);
                    console.log(err);
                    reject(err);
                } else {
                    resolve(this.toCamelCase(results));
                }
            });
        })
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

    toCamelCase(o) {
        // converting to camel case pulled from https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
        // May put this in a new file in the future, but for now, this should be fine
        if (this.isObject(o)) {
            const n = {};

            Object.keys(o)
            .forEach((k) => {
                n[this.toCamel(k)] = this.toCamelCase(o[k]);
            });

            return n;
        } else if (this.isArray(o)) {
            return o.map((i) => {
                return this.toCamelCase(i);
            });
        }

        return o;
    }

    toCamel(s) {
        return s.replace(/([-_][a-z])/ig, ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });
    };

    isObject(o) {
        return o === Object(o) && !this.isArray(o) && typeof o !== 'function';
    };

    isArray(a) {
        return Array.isArray(a);
    };
}

module.exports = DAO;