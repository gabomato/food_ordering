const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

db.run("UPDATE products SET image = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' WHERE name = 'Fish and Chips'", (err) => {
    if (err) {
        console.error('Error updating Fish and Chips:', err);
    } else {
        console.log('✓ Fish and Chips image updated to new URL');
    }
    db.close();
});
