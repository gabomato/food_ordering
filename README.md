# School Food Pre-Order Application

A full-stack web application for pre-ordering school meals, helping students access food easily and reducing food waste.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://git.fhict.nl/I571889/code_project_5.git
   cd food_ordering
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Initialize database** (if items don't show)
   ```bash
   cd ../server
   node init-database.js
   ```

5. **Start the server**
   ```bash
   cd server
   node index.js
   ```

6. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Register a new account or login

## 📁 Project Structure

```
food_ordering/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Login, Register, Dashboard
│   │   ├── data/          # Food facts JSON
│   │   └── App.css        # Styling
│   └── package.json
├── server/                # Node.js backend
│   ├── database/
│   │   ├── db.js          # Database setup
│   │   └── users.db       # SQLite database
│   ├── index.js           # Express server
│   └── init-database.js   # Database initialization script
└── SETUP.md               # Detailed setup instructions
```

## 🛠️ Technology Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Authentication**: JWT + bcrypt

## ⚠️ Troubleshooting

**Q: No food items showing on the main page?**  
A: Run the database initialization script:
```bash
cd server
node init-database.js
```

**Q: Server won't start?**  
A: Make sure port 3000 isn't in use and dependencies are installed.

**Q: Client won't start?**  
A: Check that you've run `npm install` in the client directory.

For more detailed troubleshooting, see [SETUP.md](./SETUP.md)

## 📖 Features

- ✅ User registration and authentication
- ✅ Browse food items from local providers
- ✅ Shopping cart functionality
- ✅ Order placement with pickup codes
- ✅ Order history (ongoing and past orders)
- ✅ Food waste awareness facts

## 👥 Team

**Group 4 - EN 11**

## 📄 License

This is a school project for educational purposes.
