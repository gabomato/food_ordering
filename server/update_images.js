const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

db.run("UPDATE products SET image = 'https://images.unsplash.com/photo-1588208663933-4252b0b49f43?w=400' WHERE name = 'Fish and Chips'", (err) => {
    if (err) {
        console.error('Error updating Fish and Chips:', err);
    } else {
        console.log('✓ Fish and Chips image updated');
    }
});

db.run("UPDATE products SET image = 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400' WHERE name = 'Chocolate Brownie'", (err) => {
    if (err) {
        console.error('Error updating Chocolate Brownie:', err);
    } else {
        console.log('✓ Chocolate Brownie image updated');
    }
    db.close();
});
