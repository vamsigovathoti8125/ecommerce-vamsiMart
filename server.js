const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4173;
const JWT_SECRET = process.env.JWT_SECRET || 'vamsimart-dev-secret';
const dbPath = path.join(__dirname, 'vamsimart.db');
const db = new sqlite3.Database(dbPath);

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

const categoryCatalog = {
  Electronics: { items: ['Wireless Earbuds', 'Bluetooth Speaker', 'Smart Watch', 'Power Bank', 'Desk Lamp', 'USB-C Hub', 'Portable Projector', 'Mechanical Keyboard', 'Webcam', 'Phone Stand', 'Noise Cancelling Headphones', 'Charging Dock', 'Fitness Tracker', 'Tablet Sleeve', 'Travel Adapter'], brands: ['boAt', 'NovaTech', 'Soundcore', 'Realme', 'Portronics', 'Logitech', 'JBL'], basePrice: 899, imageTerm: 'electronics' },
  Fashion: { items: ['Cotton Shirt', 'Relaxed Trousers', 'Knit Cardigan', 'Oversized Hoodie', 'Midi Dress', 'Cargo Pants', 'Everyday Sneakers', 'Denim Jacket', 'Linen Co-ord', 'Ribbed Top', 'Canvas Tote', 'Leather Belt', 'Satin Blouse', 'Pleated Skirt', 'Classic Sunglasses'], brands: ['House of Vamsi', 'Mango Street', 'Urban Loom', 'Westside Edit', 'Thread Theory', 'Cedar & Co', 'Mode Studio'], basePrice: 799, imageTerm: 'fashion clothing' },
  Beauty: { items: ['Glow Serum', 'Hydrating Moisturizer', 'Face Cleanser', 'Lip Tint', 'Hair Mask', 'Body Lotion', 'Daily Sunscreen', 'Clay Face Mask', 'Perfume Mist', 'Eye Cream', 'Bath Salts', 'Nourishing Oil', 'Makeup Brush Set', 'Hand Cream', 'Shampoo Bar'], brands: ['Glow Lab', 'Pure Ritual', 'The Botanist', 'Skin Story', 'Luma Beauty', 'Daily Dew', 'Bloom Co'], basePrice: 399, imageTerm: 'beauty skincare' },
  Home: { items: ['Ceramic Vase', 'Linen Cushion', 'Cloud Support Pillow', 'Storage Basket', 'Accent Table', 'Wall Mirror', 'Bedside Lamp', 'Cotton Bedsheet', 'Serving Tray', 'Scented Candle', 'Glass Carafe', 'Throw Blanket', 'Desk Organizer', 'Planter Pot', 'Bath Towel Set', 'Kitchen Canister'], brands: ['Loom & Oak', 'Casa Vamsi', 'Nordic Nest', 'Sunday Home', 'Form & Field', 'Warm House', 'Studio Living'], basePrice: 499, imageTerm: 'home decor' },
  Grocery: { items: ['Organic Coffee', 'Farmhouse Honey', 'Granola Mix', 'Green Tea', 'Olive Oil', 'Pantry Staples', 'Fresh Greens Box', 'Dark Chocolate', 'Almond Butter', 'Dried Fruit Mix', 'Pasta Pack', 'Coconut Water', 'Breakfast Oats', 'Spice Collection', 'Snack Box'], brands: ['Farm & Fresh', 'Harvest Table', 'Good Earth', 'Daily Pantry', 'Local Basket', 'Pure Field', 'Freshfolk'], basePrice: 249, imageTerm: 'grocery food' },
  Appliances: { items: ['Air Fryer', 'Mixer Grinder', 'Tower Fan', 'Electric Kettle', 'Rice Cooker', 'Toaster Oven', 'Hand Blender', 'Coffee Maker', 'Steam Iron', 'Room Heater', 'Induction Cooktop', 'Juicer', 'Vacuum Cleaner', 'Food Chopper', 'Kitchen Scale'], brands: ['HomePro', 'ChefMate', 'Breeze Living', 'QuickCook', 'DailyEase', 'Culina', 'Compact Living'], basePrice: 1290, imageTerm: 'kitchen appliance' },
  Sports: { items: ['Training Mat', 'Running Shoes', 'Dumbbell Set', 'Foam Roller', 'Gym Bag', 'Resistance Bands', 'Sports Bottle', 'Cycling Gloves', 'Yoga Block Set', 'Fitness Towel', 'Skipping Rope', 'Tennis Racket', 'Recovery Ball', 'Workout Shorts', 'Trail Backpack'], brands: ['FlexFit', 'Move Lab', 'ActiveArc', 'Trail Core', 'Peak Motion', 'Runwell', 'BodyKind'], basePrice: 599, imageTerm: 'fitness sports' }
};

function generateCatalogProducts() {
  const generated = [];
  let nextId = 1;
  const requiredPerCategory = 105;

  Object.entries(categoryCatalog).forEach(([category, catalog]) => {
    for (let index = 0; index < requiredPerCategory; index += 1) {
      const item = catalog.items[index % catalog.items.length];
      const brand = catalog.brands[Math.floor(index / catalog.items.length) % catalog.brands.length];
      const color = ['Midnight', 'Cloud White', 'Rose', 'Sage', 'Sand', 'Cobalt', 'Charcoal', 'Coral', 'Mint'][index % 9];
      const model = `Edition ${Math.floor(index / (catalog.items.length * catalog.brands.length)) + 1}`;
      const price = catalog.basePrice + ((index * 137) % 12) * 100;
      generated.push({
        id: nextId++,
        name: `${brand} ${item} - ${color} ${model}`,
        category,
        price,
        oldPrice: index % 3 === 0 ? price + 300 : null,
        image: `https://loremflickr.com/700/700/${encodeURIComponent(catalog.imageTerm)}?lock=${nextId}`,
        description: `A thoughtfully chosen ${item.toLowerCase()} from ${brand}, made for better everyday living. Reliable quality, considered design, and excellent value from vamsiMart.`,
        badge: index % 5 === 0 ? 'New' : index % 3 === 0 ? 'Deal' : ''
      });
    }
  });

  return generated;
}

const seedProducts = generateCatalogProducts();

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function initializeDatabase() {
  await runSql(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      oldPrice INTEGER,
      image TEXT,
      description TEXT,
      badge TEXT
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      payment_method TEXT,
      delivery_mode TEXT,
      address_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )
  `);

  const productCount = await getSql('SELECT COUNT(*) as count FROM products');
  if ((productCount?.count || 0) === 0) {
    for (const product of seedProducts) {
      await runSql(
        `INSERT INTO products (id, name, category, price, oldPrice, image, description, badge)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.category, product.price, product.oldPrice, product.image, product.description, product.badge]
      );
    }
  }

  const categoryCounts = await allSql(`SELECT category, COUNT(*) as count, COUNT(DISTINCT name) as uniqueNames, COUNT(DISTINCT image) as uniqueImages FROM products GROUP BY category`);
  const missingCategoryData = Object.keys(categoryCatalog).some((category) => {
    const row = categoryCounts.find((entry) => entry.category === category);
    return !row
      || Number(row.count) < 105
      || Number(row.uniqueNames) < Number(row.count)
      || Number(row.uniqueImages) < 20;
  });

  if (missingCategoryData) {
    await runSql('DELETE FROM products');
    for (const product of seedProducts) {
      await runSql(
        `INSERT INTO products (id, name, category, price, oldPrice, image, description, badge)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.category, product.price, product.oldPrice, product.image, product.description, product.badge]
      );
    }
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'vamsiMart API' });
});

app.get('/api/products', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const category = (req.query.category || 'All').trim();
    let sql = 'SELECT * FROM products WHERE 1 = 1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (q) {
      sql += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id ASC';
    const products = await allSql(sql, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch products.', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await getSql('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await runSql(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = { id: result.id, name: name.trim(), email: email.trim().toLowerCase() };
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create account.', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userRecord = await getSql('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!userRecord) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const passwordMatches = await bcrypt.compare(password, userRecord.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const user = { id: userRecord.id, name: userRecord.name, email: userRecord.email };
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in.', error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await getSql('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch authenticated user.', error: error.message });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await allSql(
      `SELECT o.id, o.total, o.status, o.payment_method, o.delivery_mode, o.address_json, o.created_at
       FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const formattedOrders = orders.map((order) => ({
      ...order,
      address: order.address_json ? JSON.parse(order.address_json) : null
    }));

    return res.json({ orders: formattedOrders });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch orders.', error: error.message });
  }
});

app.post('/api/orders', authMiddleware, async (req, res) => {
  const { items = [], total = '₹0', address = {}, paymentMethod = 'upi', deliveryMode = 'standard' } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }

  try {
    const orderResult = await runSql(
      `INSERT INTO orders (user_id, total, payment_method, delivery_mode, address_json)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, String(total), paymentMethod, deliveryMode, JSON.stringify(address)]
    );

    const orderId = orderResult.id;

    for (const item of items) {
      await runSql(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.id, item.name, Number(item.quantity) || 1, Number(item.price) || 0]
      );
    }

    return res.status(201).json({
      message: 'Order placed successfully.',
      order: {
        id: orderId,
        total,
        status: 'confirmed',
        paymentMethod,
        deliveryMode
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to place order.', error: error.message });
  }
});

app.post('/api/payments/confirm', authMiddleware, (req, res) => {
  const { method = 'upi', amount = '₹0' } = req.body || {};
  return res.json({
    status: 'paid',
    message: 'Payment confirmed successfully.',
    method,
    amount
  });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found.' });
  }

  const filePath = path.join(__dirname, req.path === '/' ? 'index.html' : req.path);
  return res.sendFile(filePath, (error) => {
    if (error) {
      return res.status(404).send('Page not found');
    }
  });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`vamsiMart API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database init failed:', error);
    process.exit(1);
  });
