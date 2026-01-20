const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

app.use(cors());
app.use(express.json());

// Register Route
app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: "Name, Email and password are required" });
    }

    // Validate role
    const validRoles = ['student', 'provider'];
    const userRole = validRoles.includes(role) ? role : 'student';

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, hashedPassword, userRole], function (err) {
        if (err) {
            console.error(err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "User registered successfully", userId: this.lastID });
    });
});

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ token: null, error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const bearerToken = token.split(' ')[1];
    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Get all products (Public)
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products WHERE available = 1';
    db.all(sql, [], (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(products);
    });
});

// Helper to check if product belongs to provider
const verifyProductOwnership = (userId, productId, callback) => {
    const sql = 'SELECT provider FROM products WHERE id = ?';
    db.get(sql, [productId], (err, product) => {
        if (err || !product) return callback(new Error('Product not found'));
        // We compare as strings because the provider column might be text or mixed
        if (String(product.provider) !== String(userId)) {
            return callback(new Error('Unauthorized'));
        }
        callback(null);
    });
};

// Provider: Get My Products
app.get('/api/my-products', verifyToken, (req, res) => {
    // Select products where provider matches user ID or matches user Name (to support legacy/sample data if needed, but primarily ID now)
    // For now, let's assume we filter by the provider ID stored in the column
    const sql = 'SELECT * FROM products WHERE provider = ?';
    db.all(sql, [req.userId], (err, products) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(products);
    });
});

// Provider: Add Product
app.post('/api/products', verifyToken, (req, res) => {
    const { name, description, price, image } = req.body;

    // We treat req.userId as the "provider" identifier
    const sql = 'INSERT INTO products (name, description, price, provider, image, available) VALUES (?, ?, ?, ?, ?, 1)';
    db.run(sql, [name, description, price, req.userId, image], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create product' });
        }
        res.status(201).json({ id: this.lastID, name, description, price, provider: req.userId, image });
    });
});

// Provider: Update Product (Price/Avail)
app.put('/api/products/:id', verifyToken, (req, res) => {
    const productId = req.params.id;
    const { price } = req.body;

    verifyProductOwnership(req.userId, productId, (err) => {
        if (err) return res.status(403).json({ error: err.message });

        const sql = 'UPDATE products SET price = ? WHERE id = ?';
        db.run(sql, [price, productId], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Product updated' });
        });
    });
});

// Provider: Delete Product
app.delete('/api/products/:id', verifyToken, (req, res) => {
    const productId = req.params.id;

    verifyProductOwnership(req.userId, productId, (err) => {
        if (err) return res.status(403).json({ error: err.message });

        const sql = 'DELETE FROM products WHERE id = ?';
        db.run(sql, [productId], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Product deleted' });
        });
    });
});

// Generate unique pickup code
function generatePickupCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Create order
app.post('/api/orders', verifyToken, (req, res) => {
    const { items, totalPrice } = req.body;
    const userId = req.userId;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain items' });
    }

    const pickupCode = generatePickupCode();
    const orderDate = new Date().toISOString();
    // Pickup date is next day
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1);

    const orderSql = 'INSERT INTO orders (userId, totalPrice, pickupCode, orderDate, pickupDate) VALUES (?, ?, ?, ?, ?)';

    db.run(orderSql, [userId, totalPrice, pickupCode, orderDate, pickupDate.toISOString()], function (err) {
        if (err) {
            console.error('Database error creating order:', err);
            console.error('Error message:', err.message);
            console.error('Error code:', err.code);
            return res.status(500).json({ error: 'Failed to create order', details: err.message });
        }

        const orderId = this.lastID;
        const itemSql = 'INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)';
        const stmt = db.prepare(itemSql);

        items.forEach(item => {
            stmt.run(orderId, item.productId, item.quantity);
        });

        stmt.finalize((err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save order items' });
            }
            res.status(201).json({
                message: 'Order created successfully',
                orderId: orderId,
                pickupCode: pickupCode,
                pickupDate: pickupDate.toISOString()
            });
        });
    });
});

// Get user orders
app.get('/api/orders', verifyToken, (req, res) => {
    const userId = req.userId;

    const sql = 'SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC';
    db.all(sql, [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // Get order items for each order
        const ordersWithItems = [];
        let completed = 0;

        if (orders.length === 0) {
            return res.json([]);
        }

        orders.forEach(order => {
            const itemsSql = `
                SELECT oi.quantity, p.name, p.price, p.provider 
                FROM order_items oi 
                JOIN products p ON oi.productId = p.id 
                WHERE oi.orderId = ?
            `;

            db.all(itemsSql, [order.id], (err, items) => {
                if (!err) {
                    order.items = items;
                }
                ordersWithItems.push(order);
                completed++;

                if (completed === orders.length) {
                    res.json(ordersWithItems);
                }
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
