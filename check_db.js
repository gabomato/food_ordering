const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database/users.db');

db.all("SELECT name, image FROM products WHERE name = 'Fish and Chips'", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
