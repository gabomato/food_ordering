const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

db.run("UPDATE products SET image = '/fish_and_chips.jpg' WHERE name = 'Fish and Chips'", (err) => {
    if (err) {
        console.error('Error updating Fish and Chips:', err);
    } else {
        console.log('✓ Fish and Chips image updated to /fish_and_chips.jpg');
    }
    db.close();
});
