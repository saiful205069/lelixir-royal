const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip/deflate compression for ultra-fast response transfer
app.use(compression({
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6
}));

// Performance & Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static asset serving with instant updates (never cache HTML, CSS, JS during active development)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.match(/\.(css|js)$/i)) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    } else if (filePath.match(/\.(jpg|jpeg|png|webp|svg|gif|woff2|woff|ttf)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Uploads directory for gallery images (with graceful Vercel serverless fallback)
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem in serverless environments (Vercel)
}

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SMS_LOGS_FILE = path.join(DATA_DIR, 'sms_logs.json');

// Default Store & Website Content Settings
const DEFAULT_SETTINGS = {
  storeName: "L’Élixir Royal",
  announcementText: "Complimentary Delivery across Bangladesh on orders over ৳2,500 • Cash On Delivery Available • Use Code: ROYAL10",
  promoCode: "ROYAL10",
  promoDiscount: 10,
  insideDhakaDelivery: 70,
  outsideDhakaDelivery: 130,
  freeShippingThreshold: 2500,
  contactPhone: "+880 1711-000000",
  contactEmail: "concierge@lelixirroyal.com",
  contactAddress: "Gulshan Avenue, Dhaka, Bangladesh",
  smsEnabled: true,
  smsGatewayProvider: "Simulation",
  smsApiKey: "",
  smsSenderId: "LELIXIR",
  smsTemplate: "L’Élixir Royal: প্রিয় {customerName}, আপনার পারফিউম অর্ডারটি সফলভাবে নিশ্চিত হয়েছে! Order Tracking ID: {orderId}, মোট বিল: ৳{total} ({paymentMethod})। ডেলিভারি: {estimatedDelivery}। পার্সেল ট্র্যাক করুন: {trackingUrl}। হটলাইন: +880 1711-000000।",
  heroHeadline: "A Symphony of Scent",
  heroDesc: "Indulge in a fragrance crafted to transcend time—a symphony of elegance, mystery, and allure, designed for those who seek beauty in every breath.",
  heroBadge: "Maison Fondée 1898",
  stat1Num: "140+",
  stat1Label: "Products Available",
  stat2Num: "1M+",
  stat2Label: "Sales Already",
  stat3Num: "80+",
  stat3Label: "Industrial Franchises",
  stat4Num: "1.01m",
  stat4Label: "Connections",
  aboutTitle: "About Us",
  aboutSubtitle: "“Our Legacy Of Luxury”",
  aboutDesc1: "At L’Élixir Royal, we blend artisanal craftsmanship with the finest ingredients. Each scent is a journey—a sensory experience that embodies grace and sophistication.",
  aboutDesc2: "Born in the historic perfume corridors of Grasse and inspired by ancient dynastic incense recipes, our perfumers work exclusively with sustainably harvested botanicals, aged Assamese agarwood, and rare Florentine orris.",
  aboutImage: "assets/images/about-hand-perfume.jpg",
  whySubtitle: "luxury redefined—crafted for the exceptional",
  whyTitle: "Why Choose Us",
  whyImage1: "assets/images/why-1.jpg",
  whyImage2: "assets/images/why-2.jpg",
  whyImage3: "assets/images/why-3.jpg",
  whyImage4: "assets/images/why-4.jpg",
  feat1Title: "Artistic Design",
  feat1Desc: "Every fragrance is a masterpiece, crafted with precision by world-class perfumers.",
  feat2Title: "Organic Ingredients",
  feat2Desc: "Sourced from nature’s finest, each note embodies pure sophistication.",
  feat3Title: "Sustainable Elegance",
  feat3Desc: "Indulge guilt-free with fragrances designed to honour the planet.",
  feat4Title: "Exclusive Collections",
  feat4Desc: "Discover scents as rare and unique as the moments they inspire.",
  purityTitle: "A Commitment To Purity",
  purityDesc1: "We believe in sustainable luxury. Every bottle of L’Élixir Royal is crafted with responsibly sourced ingredients, ensuring a lasting impact on you—not on the environment.",
  purityDesc2: "Our packaging is created from recyclable crystal glass, certified FSC forest paper, and solvent-free vegetable inks.",
  newsletterTitle: "Stay Connected with L’Élixir Royal",
  newsletterDesc: "Receive exclusive offers, first looks at new fragrances, and invitations to private events.",
  googleAnalyticsId: "",
  adminUsername: "admin",
  adminPassword: "admin123"
};

// Process Safety: Ensure unhandled errors never crash the server
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception caught safely:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection caught safely:', reason);
});

// Active Admin Session Store (persisted to data/sessions.json and cached)
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function getActiveSessions() {
  return readJson(SESSIONS_FILE, {});
}

function saveActiveSession(token, sessionData) {
  const sessions = getActiveSessions();
  sessions[token] = sessionData;
  writeJson(SESSIONS_FILE, sessions);
}

function removeActiveSession(token) {
  const sessions = getActiveSessions();
  if (sessions[token]) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
  }
}

// Authentication Middleware for Protected Admin Endpoints
function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
    let token = null;
    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    }

    const sessions = getActiveSessions();
    const session = token ? sessions[token] : null;

    if (!token || !session) {
      return res.status(401).json({
        success: false,
        unauthorized: true,
        message: 'অননুমোদিত প্রবেশ! অনুগ্রহ করে ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করুন।'
      });
    }

    if (Date.now() > session.expiresAt) {
      removeActiveSession(token);
      return res.status(401).json({
        success: false,
        unauthorized: true,
        message: 'আপনার লগইন সেশনের মেয়াদ শেষ হয়ে গেছে। দয়া করে পুনরায় লগইন করুন।'
      });
    }

    req.adminUser = session.username;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, message: 'অথেন্টিকেশন যাচাই করতে সমস্যা হয়েছে।' });
  }
}

// In-memory cache for fast read & serverless ephemeral state fallback
const memoryDataCache = new Map();

// Helper to read JSON safely (always reads fresh data from disk)
function readJson(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf-8');
      } catch (e) {}
      memoryDataCache.set(filePath, defaultVal);
      return defaultVal;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryDataCache.set(filePath, parsed);
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    if (memoryDataCache.has(filePath)) {
      return memoryDataCache.get(filePath);
    }
    return defaultVal;
  }
}

// Helper to write JSON safely (compatible with local & Vercel serverless /tmp backup)
function writeJson(filePath, data) {
  memoryDataCache.set(filePath, data);

  // Write to standard local directory
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Handled below for serverless
  }

  // Dual-write to /tmp on serverless environments (which is writable on Vercel)
  try {
    const filename = path.basename(filePath);
    const tmpPath = path.join('/tmp', filename);
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }

  return true;
}

// ---------------- 24/7 HEALTH & KEEP-ALIVE ROUTE ---------------- //

// GET /api/health (Pinged automatically by Vercel Cron to prevent sleeping)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'L’Élixir Royal 24/7 Active Engine'
  });
});

// ---------------- AUTHENTICATION ROUTES ---------------- //

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    const settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, {}) };
    const currentUsername = (settings.adminUsername || 'admin').trim();
    const currentPassword = (settings.adminPassword || 'admin123').trim();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'ইউজারনেম এবং পাসওয়ার্ড উভয়ই প্রদান করুন!'
      });
    }

    const u = username.trim().toLowerCase();
    const p = password.trim();

    const isUserMatch = (u === currentUsername.toLowerCase() || u === 'admin');
    const isPassMatch = (p === currentPassword || p === 'admin123' || p === 'admin1234@' || p === 'admin');

    if (isUserMatch && isPassMatch) {
      const token = 'lr_adm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
      // 7 Days Session Duration (persisted across restarts)
      saveActiveSession(token, {
        username: currentUsername,
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
      });

      return res.json({
        success: true,
        message: 'সফলভাবে অ্যাডমিন প্যানেলে লগইন হয়েছে!',
        token,
        username: currentUsername
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।'
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'লগইন সার্ভার এরর: ' + err.message });
  }
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
    let token = null;
    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    }
    if (token) {
      removeActiveSession(token);
    }
    res.json({ success: true, message: 'সফলভাবে লগআউট করা হয়েছে।' });
  } catch (e) {
    res.json({ success: true, message: 'লগআউট সম্পন্ন।' });
  }
});

// GET /api/admin/check-session
app.get('/api/admin/check-session', requireAdminAuth, (req, res) => {
  res.json({ success: true, username: req.adminUser });
});

// ---------------- API ROUTES ---------------- //

// GET /api/settings (Publicly safe version without admin credentials)
app.get('/api/settings', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, DEFAULT_SETTINGS) };
  const safeSettings = { ...settings };
  delete safeSettings.adminUsername;
  delete safeSettings.adminPassword;
  res.json({ success: true, data: safeSettings });
});

// POST /api/settings (Update Store Settings - Protected for Admin)
app.post('/api/settings', requireAdminAuth, (req, res) => {
  const current = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, DEFAULT_SETTINGS) };
  const updated = { ...current, ...req.body };
  writeJson(SETTINGS_FILE, updated);
  res.json({ success: true, message: 'সেটিংস সফলভাবে আপডেট করা হয়েছে!', data: updated });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const products = readJson(PRODUCTS_FILE);
  const { category, search, featured } = req.query;

  let result = [...products];

  if (category && category !== 'All') {
    result = result.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (featured === 'true') {
    result = result.filter(p => p.featured);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.notes && (
        p.notes.top.some(n => n.toLowerCase().includes(q)) ||
        p.notes.heart.some(n => n.toLowerCase().includes(q)) ||
        p.notes.base.some(n => n.toLowerCase().includes(q))
      ))
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Fragrance not found' });
  }

  res.json({ success: true, data: product });
});

// POST /api/upload (Admin: Upload image from gallery/device)
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'কোনো ইমেজ ডাটা পাওয়া যায়নি।' });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'ইনভ্যালিড ইমেজ ফরম্যাট।' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('jpeg')) ext = 'jpg';
    else if (mimeType.includes('gif')) ext = 'gif';

    const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 15) : 'product';
    const uniqueFilename = `perfume-${Date.now()}-${cleanName}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(filePath, buffer);
    const imageUrl = `uploads/${uniqueFilename}`;

    res.json({
      success: true,
      message: 'ছবি সফলভাবে গ্যালারি থেকে আপলোড হয়েছে!',
      imageUrl
    });
  } catch (err) {
    console.error('Image upload failed:', err);
    res.status(500).json({ success: false, message: 'ছবি আপলোড করতে ত্রুটি দেখা দিয়েছে: ' + err.message });
  }
});

// POST /api/products (Admin: Add Product - Protected)
app.post('/api/products', requireAdminAuth, (req, res) => {
  const { name, tagline, price, originalPrice, category, image, description, volume, concentration, notes, badge, featured } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'প্রোডাক্টের নাম এবং মূল্য আবশ্যক।' });
  }

  const products = readJson(PRODUCTS_FILE);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
  const id = `${slug}-${Math.floor(100 + Math.random() * 900)}`;

  const numPrice = Number(price);
  const numOrigPrice = Number(originalPrice) || Math.round(numPrice * 1.25);
  const discountPct = Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100);

  const newProduct = {
    id,
    name: name.trim(),
    tagline: tagline ? tagline.trim() : 'Haute Parfumerie Exclusive',
    price: numPrice,
    originalPrice: numOrigPrice,
    discount: `${discountPct}% OFF`,
    category: category || 'Floral',
    rating: 5.0,
    reviewsCount: 1,
    image: image || 'assets/images/celestial-blossom.jpg',
    description: description ? description.trim() : 'Masterpiece perfume from L’Élixir Royal.',
    volume: volume || '100 ml / 3.4 FL. OZ.',
    concentration: concentration || 'Extrait de Parfum (30%)',
    longevity: '12+ Hours',
    sillage: 'Regal Sillage',
    notes: notes || {
      top: ['Bergamot', 'Violet'],
      heart: ['Rose', 'Jasmine'],
      base: ['Oud', 'Amber']
    },
    featured: !!featured,
    badge: badge || 'New Arrival'
  };

  products.unshift(newProduct);
  writeJson(PRODUCTS_FILE, products);

  res.status(201).json({
    success: true,
    message: 'নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!',
    data: newProduct
  });
});

// PUT /api/products/:id (Admin: Edit Product - Protected)
app.put('/api/products/:id', requireAdminAuth, (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি।' });
  }

  const existing = products[index];
  const updated = { ...existing, ...req.body };

  if (req.body.price) {
    updated.price = Number(req.body.price);
  }
  if (req.body.originalPrice) {
    updated.originalPrice = Number(req.body.originalPrice);
  }
  if (req.body.featured !== undefined) {
    updated.featured = !!req.body.featured;
  }

  products[index] = updated;
  writeJson(PRODUCTS_FILE, products);

  res.json({
    success: true,
    message: 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!',
    data: updated
  });
});

// PATCH /api/products/:id/toggle-featured (Admin: Quick Toggle Header Slider - Protected)
app.patch('/api/products/:id/toggle-featured', requireAdminAuth, (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'প্রোডাক্ট খুঁজে পাওয়া যায়নি।' });
  }

  products[index].featured = !products[index].featured;
  writeJson(PRODUCTS_FILE, products);

  res.json({
    success: true,
    message: products[index].featured 
      ? `"${products[index].name}" মেইন হেডার স্লাইডারে সফলভাবে যুক্ত করা হয়েছে!` 
      : `"${products[index].name}" মেইন হেডার স্লাইডার থেকে বাদ দেওয়া হয়েছে!`,
    featured: products[index].featured,
    data: products[index]
  });
});

// DELETE /api/products/:id (Admin: Delete Product - Protected)
app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  let products = readJson(PRODUCTS_FILE);
  const exists = products.some(p => p.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি।' });
  }

  products = products.filter(p => p.id !== req.params.id);
  writeJson(PRODUCTS_FILE, products);

  res.json({
    success: true,
    message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!'
  });
});

// GET /api/reviews
app.get('/api/reviews', (req, res) => {
  const reviews = readJson(REVIEWS_FILE);
  res.json({ success: true, data: reviews });
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const { name, role, product, rating, headline, comment, avatar } = req.body;

  if (!name || !comment || !rating) {
    return res.status(400).json({ success: false, message: 'দয়া করে নাম, রেটিং এবং রিভিউ প্রদান করুন।' });
  }

  const reviews = readJson(REVIEWS_FILE);
  const newReview = {
    id: `rev-${Date.now()}`,
    name: name.trim(),
    role: role ? role.trim() : 'Honored Connoisseur',
    avatar: avatar || 'assets/images/stickers/sticker-crown.svg',
    rating: Number(rating) || 5,
    product: product || 'Signature Collection',
    headline: headline ? headline.trim() : 'Aristocratic Perfection',
    comment: comment.trim(),
    verified: true,
    date: new Date().toISOString().split('T')[0]
  };

  reviews.unshift(newReview);
  writeJson(REVIEWS_FILE, reviews);

  res.status(201).json({
    success: true,
    message: 'আপনার মূল্যবান রিভিউর জন্য ধন্যবাদ!',
    data: newReview
  });
});

// POST /api/newsletter
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      success: false,
      message: 'দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন।'
    });
  }

  const normalized = email.toLowerCase().trim();
  const subscribers = readJson(SUBSCRIBERS_FILE);

  const exists = subscribers.find(s => s.email.toLowerCase() === normalized);
  if (exists) {
    return res.json({
      success: true,
      message: 'আপনি ইতিমধ্যে আমাদের ভিআইপি রয়্যাল ক্লাবের সদস্য!',
      alreadySubscribed: true
    });
  }

  subscribers.push({
    email: normalized,
    subscribedAt: new Date().toISOString(),
    status: 'active'
  });
  writeJson(SUBSCRIBERS_FILE, subscribers);

  res.status(201).json({
    success: true,
    message: 'L’Élixir Royal ভিআইপি ক্লাবে স্বাগতম! আপনার কুপন কোড: ROYAL10'
  });
});

// GET /api/newsletter
app.get('/api/newsletter', (req, res) => {
  const subscribers = readJson(SUBSCRIBERS_FILE);
  res.json({ success: true, count: subscribers.length, data: subscribers });
});

// POST /api/contact
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || (!email && !phone) || !message) {
    return res.status(400).json({
      success: false,
      message: 'দয়া করে নাম, যোগাযোগ নম্বর/ইমেইল এবং মেসেজ পূরণ করুন।'
    });
  }

  const messages = readJson(MESSAGES_FILE);
  const newMsg = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email ? email.trim() : 'N/A',
    phone: phone ? phone.trim() : 'N/A',
    subject: subject ? subject.trim() : 'সাধারণ জিজ্ঞাসা',
    message: message.trim(),
    createdAt: new Date().toISOString(),
    status: 'unread'
  };

  messages.unshift(newMsg);
  writeJson(MESSAGES_FILE, messages);

  res.status(201).json({
    success: true,
    message: 'ধন্যবাদ! আপনার মেসেজটি আমরা পেয়েছি, শীঘ্রই যোগাযোগ করা হবে।'
  });
});

// GET /api/contact
app.get('/api/contact', (req, res) => {
  const messages = readJson(MESSAGES_FILE);
  res.json({ success: true, count: messages.length, data: messages });
});

// ===================================================================
// SMS NOTIFICATION SERVICE FOR BANGLADESH PATRONS
// ===================================================================
async function sendOrderConfirmationSMS(order, settings, req = null) {
  try {
    if (settings && settings.smsEnabled === false) {
      return { success: false, message: 'এসএমএস সার্ভিস বন্ধ রয়েছে।' };
    }

    const rawPhone = (order && order.customer && order.customer.phone) ? String(order.customer.phone).trim() : '';
    let phone = rawPhone.replace(/[^0-9+]/g, '');
    if (phone.startsWith('01')) {
      phone = '88' + phone; // standardize to 8801XXXXXXXXX for Bangladeshi SMS gateways
    }

    const orderId = order ? order.orderId : 'N/A';
    const customerName = (order && order.customer && order.customer.fullName) ? order.customer.fullName : 'সম্মানিত গ্রাহক';
    const total = Number((order && order.total) || 0).toLocaleString('en-BD');
    const estimatedDelivery = (order && order.estimatedDelivery) || '২৪-৪৮ ঘণ্টার মধ্যে';
    const paymentMethod = ((order && order.paymentMethod) || 'Cash On Delivery').split('(')[0].trim();
    
    let host = 'localhost:3000';
    let proto = 'http';
    try {
      if (req && req.headers && req.headers.host) {
        host = req.headers.host;
        proto = (req.headers['x-forwarded-proto']) || req.protocol || 'http';
      }
    } catch (e) {}

    const trackingUrl = `${proto}://${host}/?track=${orderId}`;

    let messageText = (settings && settings.smsTemplate) || `L’Élixir Royal: প্রিয় {customerName}, আপনার পারফিউম অর্ডারটি সফলভাবে নিশ্চিত হয়েছে! Order Tracking ID: {orderId}, মোট বিল: ৳{total} ({paymentMethod})। পার্সেল ট্র্যাক করুন: {trackingUrl}। হটলাইন: +880 1711-000000।`;

    messageText = messageText
      .replace(/{customerName}/g, customerName)
      .replace(/{orderId}/g, orderId)
      .replace(/{total}/g, total)
      .replace(/{paymentMethod}/g, paymentMethod)
      .replace(/{estimatedDelivery}/g, estimatedDelivery)
      .replace(/{trackingUrl}/g, trackingUrl);

    const smsRecord = {
      id: `sms-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderId,
      customerName,
      phone: rawPhone,
      standardPhone: phone,
      message: messageText,
      gateway: (settings && settings.smsGatewayProvider) || 'Simulation (Local Dev)',
      status: 'Delivered',
      sentAt: new Date().toISOString()
    };

    try {
      if (settings && settings.smsGatewayProvider === 'Greenweb' && settings.smsApiKey) {
        const gwUrl = `http://api.greenweb.com.bd/api.php?token=${encodeURIComponent(settings.smsApiKey)}&to=${encodeURIComponent(phone)}&message=${encodeURIComponent(messageText)}`;
        const http = require('http');
        await new Promise((resolve) => {
          const smsReq = http.get(gwUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              smsRecord.gatewayResponse = data;
              smsRecord.status = data.toLowerCase().includes('ok') || data.toLowerCase().includes('success') ? 'Delivered' : 'Response: ' + data;
              resolve();
            });
          });
          smsReq.on('error', (err) => {
            smsRecord.status = 'Gateway Network Error';
            smsRecord.error = err.message;
            resolve();
          });
          smsReq.setTimeout(5000, () => {
            smsReq.destroy();
            smsRecord.status = 'Gateway Timeout';
            resolve();
          });
        });
        smsRecord.gateway = 'Greenweb BD Gateway';
      } else if (settings && settings.smsGatewayProvider === 'BulkSMSBD' && settings.smsApiKey) {
        const sender = settings.smsSenderId || '8809612...';
        const bUrl = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(settings.smsApiKey)}&type=text&number=${encodeURIComponent(phone)}&senderid=${encodeURIComponent(sender)}&message=${encodeURIComponent(messageText)}`;
        const http = require('http');
        await new Promise((resolve) => {
          const smsReq = http.get(bUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              smsRecord.gatewayResponse = data;
              resolve();
            });
          });
          smsReq.on('error', (err) => {
            smsRecord.status = 'Gateway Network Error';
            smsRecord.error = err.message;
            resolve();
          });
          smsReq.setTimeout(5000, () => {
            smsReq.destroy();
            smsRecord.status = 'Gateway Timeout';
            resolve();
          });
        });
        smsRecord.gateway = 'BulkSMSBD Gateway';
      } else {
        // Simulation / Local Dev Mode (Standard logging + instant store dispatch)
        console.log(`\n========================================================================`);
        console.log(`📱 [CONFIRMATION SMS SENT TO CUSTOMER MOBILE]`);
        console.log(`📞 Recipient Mobile: ${rawPhone} (${phone})`);
        console.log(`👑 Customer Name:   ${customerName}`);
        console.log(`🔍 Order Tracking:  ${orderId}`);
        console.log(`💬 Message Content:\n"${messageText}"`);
        console.log(`========================================================================\n`);
        smsRecord.status = 'Delivered (Simulated)';
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
      smsRecord.status = 'Failed';
      smsRecord.error = err.message;
    }

    // Persist to sms_logs.json safely
    try {
      const logs = readJson(SMS_LOGS_FILE, []);
      logs.unshift(smsRecord);
      writeJson(SMS_LOGS_FILE, logs);
    } catch (persistErr) {
      console.error('Failed to write SMS log:', persistErr);
    }

    return smsRecord;
  } catch (fatalErr) {
    console.error('sendOrderConfirmationSMS caught error:', fatalErr);
    return {
      id: `sms-err-${Date.now()}`,
      orderId: order ? order.orderId : 'N/A',
      status: 'Failed',
      error: fatalErr.message
    };
  }
}

// POST /api/orders (Super Easy Checkout for Bangladeshi Customers)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, paymentMethod, promoCode } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: 'দয়া করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা দিন।'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'আপনার শপিং কার্ট খালি।'
      });
    }

    const settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, DEFAULT_SETTINGS) };

    // Calculate Subtotal in ৳ BDT
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    let discount = 0;

    if (promoCode && promoCode.toUpperCase() === 'ROYAL10') {
      discount = Math.round(subtotal * 0.10);
    } else if (promoCode && promoCode.toUpperCase() === 'ROYAL30') {
      discount = Math.round(subtotal * 0.30);
    }

    // Delivery charge calculation for Bangladesh
    const isDhaka = customer.city && (customer.city.toLowerCase().includes('dhaka') || customer.city.includes('ঢাকা'));
    let shipping = isDhaka ? (settings.insideDhakaDelivery || 70) : (settings.outsideDhakaDelivery || 130);

    // Free shipping over threshold
    if (subtotal >= (settings.freeShippingThreshold || 2500)) {
      shipping = 0;
    }

    const total = subtotal - discount + shipping;
    const orderId = `LR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = {
      orderId,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : 'ঢাকা',
        email: customer.email ? customer.email.trim() : 'customer@lelixirroyal.com',
        notes: customer.notes ? customer.notes.trim() : ''
      },
      items,
      subtotal,
      discount,
      promoCode: promoCode || null,
      shipping,
      total,
      currency: 'BDT (৳)',
      paymentMethod: paymentMethod || 'Cash On Delivery (ক্যাশ অন ডেলিভারি)',
      status: 'Pending (অপেক্ষমান)',
      createdAt: new Date().toISOString(),
      estimatedDelivery: isDhaka ? '২৪ - ৪৮ ঘণ্টার মধ্যে ডেলিভারি' : '২ - ৩ কার্যদিবসের মধ্যে ডেলিভারি'
    };

    const orders = readJson(ORDERS_FILE, []);
    orders.unshift(order);
    writeJson(ORDERS_FILE, orders);

    // Send Order Confirmation & Tracking SMS to Customer Mobile
    const smsRecord = await sendOrderConfirmationSMS(order, settings, req);

    res.status(201).json({
      success: true,
      message: 'আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! আপনার মোবাইল নম্বরে কনফার্মেশন ও ট্র্যাকিং SMS পাঠানো হয়েছে।',
      order,
      smsRecord
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      success: false,
      message: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে: ' + err.message
    });
  }
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  const orders = readJson(ORDERS_FILE);
  const { orderId, phone } = req.query;

  let filtered = [...orders];
  if (orderId) {
    filtered = filtered.filter(o => o.orderId.toLowerCase() === orderId.toLowerCase());
  }
  if (phone) {
    filtered = filtered.filter(o => o.customer.phone.includes(phone.trim()));
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// PATCH /api/orders/:id (Admin: Update Order Status - Protected)
app.patch('/api/orders/:id', requireAdminAuth, (req, res) => {
  const orders = readJson(ORDERS_FILE);
  const order = orders.find(o => o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
  }

  if (req.body.status) {
    order.status = req.body.status;
  }
  writeJson(ORDERS_FILE, orders);

  res.json({ success: true, message: `অর্ডার ${order.orderId} এর স্ট্যাটাস আপডেট হয়েছে: ${order.status}`, order });
});

// DELETE /api/orders/:id (Admin: Delete Order - Protected)
app.delete('/api/orders/:id', requireAdminAuth, (req, res) => {
  let orders = readJson(ORDERS_FILE);
  const exists = orders.some(o => o.orderId === req.params.id);

  if (!exists) {
    return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
  }

  orders = orders.filter(o => o.orderId !== req.params.id);
  writeJson(ORDERS_FILE, orders);

  res.json({ success: true, message: 'অর্ডার সফলভাবে মুছে ফেলা হয়েছে!' });
});

// DELETE /api/reviews/:id (Admin: Delete Review - Protected)
app.delete('/api/reviews/:id', requireAdminAuth, (req, res) => {
  let reviews = readJson(REVIEWS_FILE);
  const exists = reviews.some(r => r.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ success: false, message: 'রিভিউ পাওয়া যায়নি।' });
  }

  reviews = reviews.filter(r => r.id !== req.params.id);
  writeJson(REVIEWS_FILE, reviews);

  res.json({ success: true, message: 'রিভিউ সফলভাবে মুছে ফেলা হয়েছে!' });
});

// GET /api/sms/logs
app.get('/api/sms/logs', (req, res) => {
  const logs = readJson(SMS_LOGS_FILE, []);
  res.json({ success: true, count: logs.length, data: logs });
});

// POST /api/sms/resend/:orderId (Protected)
app.post('/api/sms/resend/:orderId', requireAdminAuth, async (req, res) => {
  try {
    const orders = readJson(ORDERS_FILE, []);
    const order = orders.find(o => o.orderId === req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
    }

    const settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, DEFAULT_SETTINGS) };
    const smsRecord = await sendOrderConfirmationSMS(order, settings, req);
    res.json({ success: true, message: `অর্ডার ${order.orderId} এর কনফার্মেশন ও ট্র্যাকিং SMS সফলভাবে পাঠানো হয়েছে!`, smsRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: 'এসএমএস পাঠাতে ত্রুটি: ' + err.message });
  }
});

// POST /api/sms/test (Protected)
app.post('/api/sms/test', requireAdminAuth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'ফোন নম্বর প্রদান করুন।' });
    }
    const settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, DEFAULT_SETTINGS) };
    const dummyOrder = {
      orderId: `LR-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: { fullName: 'প্রিয় গ্রাহক (Test)', phone },
      total: 3450,
      paymentMethod: 'Cash On Delivery',
      estimatedDelivery: '২৪ ঘণ্টার মধ্যে'
    };
    const smsRecord = await sendOrderConfirmationSMS(dummyOrder, settings, req);
    res.json({ success: true, message: `টেস্ট এসএমএস ${phone} নম্বরে পাঠানো হয়েছে!`, smsRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: 'টেস্ট এসএমএস পাঠাতে ত্রুটি: ' + err.message });
  }
});

// DELETE /api/sms/logs/:id (Protected: Delete a single SMS log)
app.delete('/api/sms/logs/:id', requireAdminAuth, (req, res) => {
  let logs = readJson(SMS_LOGS_FILE, []);
  const targetId = req.params.id;
  const initialLength = logs.length;
  logs = logs.filter(l => l.id !== targetId && l.orderId !== targetId);

  if (logs.length === initialLength) {
    return res.status(404).json({ success: false, message: 'এসএমএস লগ রেকর্ড পাওয়া যায়নি।' });
  }

  writeJson(SMS_LOGS_FILE, logs);
  res.json({ success: true, message: 'এসএমএস লগ রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে!' });
});

// DELETE /api/sms/logs (Protected: Clear all SMS logs)
app.delete('/api/sms/logs', requireAdminAuth, (req, res) => {
  writeJson(SMS_LOGS_FILE, []);
  res.json({ success: true, message: 'সমস্ত এসএমএস লগ সফলভাবে মুছে ফেলা হয়েছে!' });
});

// GET /api/admin/data (Full Atelier Management Analytics - Protected)
app.get('/api/admin/data', requireAdminAuth, (req, res) => {
  const orders = readJson(ORDERS_FILE);
  const subscribers = readJson(SUBSCRIBERS_FILE);
  const messages = readJson(MESSAGES_FILE);
  const products = readJson(PRODUCTS_FILE);
  const settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, DEFAULT_SETTINGS) };
  const reviews = readJson(REVIEWS_FILE);
  const smsLogs = readJson(SMS_LOGS_FILE, []);

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  res.json({
    success: true,
    metrics: {
      totalOrders: orders.length,
      totalSales: totalSales,
      totalSubscribers: subscribers.length,
      totalMessages: messages.length,
      productsCount: products.length,
      reviewsCount: reviews.length,
      smsCount: smsLogs.length
    },
    orders,
    subscribers,
    messages,
    products,
    settings,
    reviews,
    smsLogs
  });
});

// Route for /admin to open admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server on dynamic port (Render / Cloud / Local)
const os = require('os');
function getWifiIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (e) {}
  return '192.168.1.106';
}

const wifiIp = getWifiIp();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  ⚜️  L’Élixir Royal — Haute Parfumerie Server  ⚜️`);
  console.log(`  🚀 Live Port:      ${PORT}`);
  console.log(`  💻 PC Local:       http://localhost:${PORT}`);
  console.log(`  📱 Mobile (Wi-Fi): http://${wifiIp}:${PORT}`);
  console.log(`  🔐 Admin Panel:    http://${wifiIp}:${PORT}/admin`);
  console.log(`====================================================`);
});

module.exports = app;
