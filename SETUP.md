# Setup Instructions for New Installations

## Problem
When you clone this repository on a new PC, the main page doesn't show any food items because the database may not have the product data populated correctly.

## Root Cause
The application uses a SQLite database (`server/database/users.db`). While the database file is committed to Git, there are scenarios where it might not populate correctly:

1. **Database not committed properly** - If the database wasn't pushed to GitLab
2. **Empty database committed** - If an empty version was committed instead of the one with data
3. **Binary file corruption** - SQLite files can sometimes have issues with Git

## Solution: Database Initialization Script

We've created a setup script that will automatically populate your database with the food items.

### Step 1: Check if Database Has Data

After cloning the repository, run this command to check if products exist:

```bash
cd server
node -e "const db = require('./database/db'); db.all('SELECT COUNT(*) as count FROM products', (err, row) => { if (err) console.error(err); else console.log('Products in database:', row[0].count); process.exit(); });"
```

### Step 2: Run the Initialization Script

If the count is 0 or you get an error, run the initialization script:

```bash
cd server
node init-database.js
```

This script will:
- Check if the products table is empty
- Insert all 12 food items with images
- Verify the data was inserted correctly

### Step 3: Verify Installation

1. Start the server:
   ```bash
   cd server
   node index.js
   ```

2. Start the client (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to the application
4. Login or register
5. You should now see all food items on the main page

## Alternative: Full Reset

If you want to completely reset the database:

1. Delete the database file:
   ```bash
   rm server/database/users.db
   ```
   (On Windows: `del server\database\users.db`)

2. Restart the server - it will automatically create a new database and populate it with sample data

## Troubleshooting

### No items showing after following steps above

1. Open browser console (F12)
2. Check for errors in the Network tab
3. Verify the API call to `http://localhost:3000/api/products` returns data

### Server won't start

1. Make sure you've installed dependencies:
   ```bash
   cd server
   npm install
   ```

2. Check if port 3000 is already in use

### Client won't start

1. Install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Make sure you're running Node.js version 14 or higher

## For Developers

The database initialization happens in `server/database/db.js` (lines 83-108). The logic checks if the products table is empty and only inserts data if count is 0.

**Issue**: If the table exists but is empty (which can happen in some scenarios), the seed data won't insert.

**Solution**: The `init-database.js` script forces insertion of seed data regardless of table state.
