const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.resolve(__dirname, 'database', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to database:', dbPath);
});

// Sample products data
const products = [
    ['Pizza Margherita', 'Fresh tomato sauce, mozzarella, basil', 5.99, 'Pizza Palace', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'],
    ['Chicken Sandwich', 'Grilled chicken, lettuce, tomato, mayo', 4.50, 'Sandwich Corner', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400'],
    ['Caesar Salad', 'Romaine lettuce, croutons, parmesan, caesar dressing', 3.99, 'Fresh Greens', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'],
    ['Cheeseburger', 'Beef patty, cheese, lettuce, tomato, onion', 6.50, 'Burger House', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'],
    ['Pasta Carbonara', 'Spaghetti, bacon, eggs, parmesan cheese', 7.25, 'Italian Kitchen', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'],
    ['Vegetable Wrap', 'Mixed vegetables, hummus, whole wheat wrap', 4.25, 'Healthy Bites', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'],
    ['Chicken Nuggets', '8 pieces crispy chicken nuggets with sauce', 3.75, 'Fast Food Co', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400'],
    ['Fish and Chips', 'Battered fish fillet with french fries', 8.99, 'Ocean Catch', 'https://images.unsplash.com/photo-1588208663933-4252b0b49f43?w=400'],
    ['Tacos (3 pcs)', 'Beef tacos with salsa, cheese, lettuce', 5.50, 'Taco Town', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400'],
    ['Sushi Combo', '8 pieces mixed sushi rolls', 9.99, 'Sushi Express', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'],
    ['Chocolate Brownie', 'Rich chocolate brownie with ice cream', 3.50, 'Sweet Treats', 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400'],
    ['Fresh Fruit Bowl', 'Mixed seasonal fruits', 4.00, 'Fresh Greens', 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400']
];

console.log('Initializing database with food items...');

// First, check current count
db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
        console.error('Error checking products:', err.message);
        process.exit(1);
    }

    console.log(`Current number of products: ${row.count}`);

    if (row.count > 0) {
        console.log('⚠️  Products already exist in database.');
        console.log('Do you want to:');
        console.log('1. Keep existing products and exit (recommended)');
        console.log('2. Delete all and re-insert fresh data');
        console.log('\nTo re-insert, run: node init-database.js --force');

        // Check if --force flag is present
        if (process.argv.includes('--force')) {
            console.log('\n🔄 Force flag detected. Deleting existing products...');
            deleteAndInsert();
        } else {
            console.log('\n✅ Keeping existing data. Exiting.');
            db.close();
            process.exit(0);
        }
    } else {
        console.log('📦 Products table is empty. Inserting sample data...');
        insertProducts();
    }
});

function deleteAndInsert() {
    db.run('DELETE FROM products', (err) => {
        if (err) {
            console.error('Error deleting products:', err.message);
            process.exit(1);
        }
        console.log('✅ Deleted existing products.');
        insertProducts();
    });
}

function insertProducts() {
    const stmt = db.prepare('INSERT INTO products (name, description, price, provider, image) VALUES (?, ?, ?, ?, ?)');

    let inserted = 0;
    products.forEach((product, index) => {
        stmt.run(product, (err) => {
            if (err) {
                console.error(`Error inserting product ${index + 1}:`, err.message);
            } else {
                inserted++;
                console.log(`✓ Inserted: ${product[0]}`);
            }

            // Check if all products have been processed
            if (index === products.length - 1) {
                stmt.finalize((finalizeErr) => {
                    if (finalizeErr) {
                        console.error('Error finalizing statement:', finalizeErr.message);
                    }

                    // Verify insertion
                    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
                        if (err) {
                            console.error('Error verifying products:', err.message);
                        } else {
                            console.log(`\n✅ Database initialized successfully!`);
                            console.log(`📊 Total products in database: ${row.count}`);
                        }
                        db.close();
                        process.exit(0);
                    });
                });
            }
        });
    });
}
