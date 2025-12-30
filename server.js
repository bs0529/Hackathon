import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fishData } from './src/fishData.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./fishing_game.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT UNIQUE NOT NULL,
      money INTEGER DEFAULT 0,
      pollution_level INTEGER DEFAULT 0
    )`);

    // Species table
    db.run(`CREATE TABLE IF NOT EXISTS species (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      habitat TEXT NOT NULL,
      image_url TEXT,
      description TEXT
    )`);

    // Fish caught table
    db.run(`CREATE TABLE IF NOT EXISTS fish_caught (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      species_id INTEGER,
      count INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (species_id) REFERENCES species (id),
      UNIQUE(user_id, species_id)
    )`);

    // Shop items table
    db.run(`CREATE TABLE IF NOT EXISTS shop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      type TEXT NOT NULL
    )`);

    // Populate species table if empty
    db.get('SELECT COUNT(*) as count FROM species', (err, row) => {
      if (row.count === 0) {
        populateSpecies();
      }
    });

    // Populate shop items if empty
    db.get('SELECT COUNT(*) as count FROM shop_items', (err, row) => {
      if (row.count === 0) {
        populateShopItems();
      }
    });
  });
}

// Populate species from fishData
function populateSpecies() {
  const stmt = db.prepare('INSERT INTO species (name, type, habitat, image_url, description) VALUES (?, ?, ?, ?, ?)');
  fishData.forEach(fish => {
    stmt.run(fish.name, 'NORMAL', fish.ovrHbttNm, fish.image2d, fish.description);
  });
  stmt.finalize();
  console.log('Species populated.');
}

// Populate shop items
function populateShopItems() {
  const items = [
    { name: 'Better Rod', description: 'Increases fishing success rate', price: 100, type: 'upgrade' },
    { name: 'Lure', description: 'Attracts rare fish', price: 50, type: 'bait' },
    { name: 'Boat', description: 'Access to deeper waters', price: 500, type: 'upgrade' }
  ];
  const stmt = db.prepare('INSERT INTO shop_items (name, description, price, type) VALUES (?, ?, ?, ?)');
  items.forEach(item => {
    stmt.run(item.name, item.description, item.price, item.type);
  });
  stmt.finalize();
  console.log('Shop items populated.');
}

// API Routes

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Fishing Game API' });
});

// Game endpoints

// Fishing
app.post('/game/fish', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(422).json({ error: 'user_id required' });
  }

  // Simple fishing logic - randomly select a fish
  const randomFish = fishData[Math.floor(Math.random() * fishData.length)];
  const isNew = Math.random() > 0.5; // Simple logic for new catch
  const pollutionLevel = Math.floor(Math.random() * 100);

  res.json({
    species_name: randomFish.name,
    species_type: 'NORMAL',
    image_url: randomFish.image2d,
    is_new: isNew,
    pollution_level: pollutionLevel
  });
});

// Handle action
app.post('/game/action', (req, res) => {
  const { user_id, species_id, action } = req.body;
  if (!user_id || !species_id || !action) {
    return res.status(422).json({ error: 'user_id, species_id, action required' });
  }

  // Simple action handling
  if (action === 'SELL') {
    // Increase user money
    db.run('UPDATE users SET money = money + 10 WHERE id = ?', [user_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Sold successfully' });
    });
  } else if (action === 'RELEASE') {
    // Decrease pollution
    db.run('UPDATE users SET pollution_level = MAX(0, pollution_level - 5) WHERE id = ?', [user_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Released successfully' });
    });
  } else if (action === 'AQUARIUM') {
    // Record in collection
    db.run('INSERT OR REPLACE INTO fish_caught (user_id, species_id, count) VALUES (?, ?, COALESCE((SELECT count FROM fish_caught WHERE user_id = ? AND species_id = ?), 0) + 1)',
           [user_id, species_id, user_id, species_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Added to aquarium' });
    });
  } else {
    res.status(422).json({ error: 'Invalid action' });
  }
});

// Get collection
app.get('/game/collection/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.all(`
    SELECT s.id as species_id, s.name, s.type, s.image_url, COALESCE(fc.count, 0) as caught_count,
           CASE WHEN fc.count > 0 THEN 1 ELSE 0 END as is_caught
    FROM species s
    LEFT JOIN fish_caught fc ON s.id = fc.species_id AND fc.user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// User endpoints

// Create user
app.post('/users/', (req, res) => {
  const { nickname } = req.body;
  if (!nickname) {
    return res.status(422).json({ error: 'nickname required' });
  }

  db.run('INSERT INTO users (nickname) VALUES (?)', [nickname], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(422).json({ error: 'Nickname already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: this.lastID, nickname, money: 0, pollution_level: 0 });
  });
});

// Get all users
app.get('/users/list', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get user by id
app.get('/users/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

// Shop endpoints

// Get items
app.get('/shop/items', (req, res) => {
  db.all('SELECT * FROM shop_items', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Buy item
app.post('/shop/buy', (req, res) => {
  const { user_id, item_id } = req.body;
  if (!user_id || !item_id) {
    return res.status(422).json({ error: 'user_id and item_id required' });
  }

  // Get item price
  db.get('SELECT price FROM shop_items WHERE id = ?', [item_id], (err, item) => {
    if (err || !item) {
      return res.status(422).json({ error: 'Item not found' });
    }

    // Check user money
    db.get('SELECT money FROM users WHERE id = ?', [user_id], (err, user) => {
      if (err || !user) {
        return res.status(422).json({ error: 'User not found' });
      }

      if (user.money < item.price) {
        return res.status(422).json({ error: 'Insufficient funds' });
      }

      // Deduct money
      db.run('UPDATE users SET money = money - ? WHERE id = ?', [item.price, user_id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Purchase successful' });
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
