const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database file in the database directory
const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Serialize allows us to run these queries sequentially
db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'student'
    )`, (err) => {
        if (err) {
            console.error('Error creating table: ' + err.message);
        } else {
            console.log('Users table created or already exists.');
        }
    });

    // Create products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        provider TEXT NOT NULL,
        image TEXT,
        available INTEGER DEFAULT 1
    )`, (err) => {
        if (err) {
            console.error('Error creating products table: ' + err.message);
        } else {
            console.log('Products table created or already exists.');
        }
    });

    // Create orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        totalPrice REAL NOT NULL,
        pickupCode TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'ordered',
        orderDate TEXT NOT NULL,
        pickupDate TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('Error creating orders table: ' + err.message);
        } else {
            console.log('Orders table created or already exists.');
        }
    });

    // Create order_items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (productId) REFERENCES products (id)
    )`, (err) => {
        if (err) {
            console.error('Error creating order_items table: ' + err.message);
        } else {
            console.log('Order_items table created or already exists.');
        }
    });

    // Insert sample products if table is empty
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (!err && row.count === 0) {
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

            const stmt = db.prepare('INSERT INTO products (name, description, price, provider, image) VALUES (?, ?, ?, ?, ?)');
            products.forEach(product => {
                stmt.run(product);
            });
            stmt.finalize(() => {
                console.log('Sample products inserted.');
            });
        }
    });
});

module.exports = db;
