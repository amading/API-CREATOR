# API SETUP GUIDE — Piliin ang API mo, Kopyahin, Tapos na!
### Complete Tagalog Guide na may JWT + Encryption

---

## UNANG HAKBANG — Base Setup (KAILANGAN PALAGI)

### 1. I-install ang packages
```bash
npm install express jsonwebtoken bcryptjs cors helmet morgan express-rate-limit express-slow-down multer
```

### 2. Gumawa ng `.env` file
```bash
copy .env.example .env
```

Buksan ang `.env` at punan — i-run ang bawat linya sa terminal para makuha ang keys:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/iyong-db
JWT_SECRET=<output ng command 1>
JWT_REFRESH_SECRET=<output ng command 2>
JWT_ENCRYPTION_KEY=<output ng command 3>
CORS_ORIGIN=http://localhost:5173
API_KEY=<output ng command 4>
NODE_ENV=development
```

### 3. Simulan ang server
```bash
node server.js
```

---

## PUMILI NG API — Lagyan ng tsek ang gusto mo

```
[ ] AUTH API       — Register, Login, Logout, Refresh Token  (KAILANGAN PALAGI)
[ ] USERS API      — CRUD ng mga users, admin management
[ ] PRODUCTS API   — CRUD ng mga produkto, may search + paginate
[ ] POSTS API      — CRUD ng mga post/blog, may likes
[ ] ORDERS API     — E-commerce orders, status tracking
[ ] FILES API      — Upload at delete ng files/images
[ ] NOTIFICATIONS  — In-app notifications, read/unread
```

Para sa bawat API na pinili mo:
1. **Kopyahin ang code** sa seksyon nito sa ibaba
2. **I-save** sa `routes/` folder
3. **I-dagdag** sa `server.js` (tingnan ang HAKBANG sa dulo)

---

---

# BASE FILES — Kailangan ng lahat ng API

> Gumawa ng mga folder na ito:
> ```
> mkdir config middleware routes utils
> ```

---

## `config/config.js`

```javascript
module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/mydb",
  JWT_SECRET: process.env.JWT_SECRET || "palitan-mo",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "palitan-mo-rin",
  JWT_ENCRYPTION_KEY: process.env.JWT_ENCRYPTION_KEY || "0000000000000000000000000000000000000000000000000000000000000000",
  JWT_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
    MESSAGE: "Napakaraming request. Pakihintay ng ilang minuto.",
  },
  AUTH_RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 10,
    MESSAGE: "Napakaraming login attempts. Pakihintay ng 15 minuto.",
  },
  SLOW_DOWN: {
    DELAY_AFTER: 50,
    DELAY_MS: 500,
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  UPLOAD: {
    DEST: "uploads/",
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  },
  API_KEY: process.env.API_KEY || "palitan-mo",
};
```

---

## `utils/response.js`

```javascript
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
```

---

## `utils/tokenUtils.js`

```javascript
const crypto = require("crypto");
const config = require("../config/config");

function encryptPayload(data) {
  const key = Buffer.from(config.JWT_ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decryptPayload(encryptedStr) {
  const key = Buffer.from(config.JWT_ENCRYPTION_KEY, "hex");
  const buf = Buffer.from(encryptedStr, "base64url");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encryptPayload, decryptPayload };
```

---

## `middleware/rateLimiter.js`

```javascript
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const config = require("../config/config");

const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: config.RATE_LIMIT.MESSAGE },
  handler: (req, res, next, options) => {
    console.warn(`[RATE LIMIT] IP: ${req.ip} | Route: ${req.path}`);
    res.status(429).json(options.message);
  },
});

const authLimiter = rateLimit({
  windowMs: config.AUTH_RATE_LIMIT.WINDOW_MS,
  max: config.AUTH_RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: config.AUTH_RATE_LIMIT.MESSAGE },
  handler: (req, res, next, options) => {
    console.warn(`[AUTH LIMIT] Brute force attempt from IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

const speedLimiter = slowDown({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  delayAfter: config.SLOW_DOWN.DELAY_AFTER,
  delayMs: () => config.SLOW_DOWN.DELAY_MS,
});

module.exports = { generalLimiter, authLimiter, speedLimiter };
```

---

## `middleware/auth.js`

```javascript
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { decryptPayload } = require("../utils/tokenUtils");
const { errorResponse } = require("../utils/response");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return errorResponse(res, "Walang token. Kailangan mag-login.", 401);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = decryptPayload(decoded.data);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return errorResponse(res, "Expired na ang token. I-refresh ang session.", 401);
    return errorResponse(res, "Hindi valid ang token.", 403);
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin")
      return errorResponse(res, "Admin lang ang may access dito.", 403);
    next();
  });
};

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== config.API_KEY)
    return errorResponse(res, "Hindi valid ang API Key.", 401);
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyApiKey };
```

---

---

# ✅ AUTH API — `routes/auth.js`
### Register · Login · Logout · Refresh Token
> KAILANGAN PALAGI — ito ang pundasyon ng lahat

```javascript
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const config = require("../config/config");
const { authLimiter } = require("../middleware/rateLimiter");
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");
const { encryptPayload } = require("../utils/tokenUtils");

// PALITAN NG TUNAY NA DATABASE
const users = [];
const refreshTokenStore = new Map();

function generateAccessToken(userId, role) {
  return jwt.sign(
    { data: encryptPayload({ id: userId, role }) },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN, algorithm: "HS256" }
  );
}

function generateRefreshToken(userId, role) {
  const token = crypto.randomBytes(64).toString("hex");
  refreshTokenStore.set(token, { userId, role });
  return token;
}

// POST /api/auth/register
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return errorResponse(res, "Kumpleto ang name, email, at password.", 400);
    if (password.length < 8)
      return errorResponse(res, "Dapat 8 characters pataas ang password.", 400);

    // PALITAN: const exists = await User.findOne({ email })
    const exists = users.find((u) => u.email === email);
    if (exists) return errorResponse(res, "Ginagamit na ang email na iyon.", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    // PALITAN: const newUser = await User.create({...})
    const newUser = { id: Date.now().toString(), name, email, password: hashedPassword, role: "user", createdAt: new Date() };
    users.push(newUser);

    return successResponse(res, "Matagumpay na nagrehistro!", {
      accessToken: generateAccessToken(newUser.id, newUser.role),
      refreshToken: generateRefreshToken(newUser.id, newUser.role),
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    }, 201);
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return errorResponse(res, "May error sa pagre-rehistro.");
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse(res, "Kailangan ang email at password.", 400);

    // PALITAN: const user = await User.findOne({ email })
    const user = users.find((u) => u.email === email);
    if (!user) return errorResponse(res, "Mali ang email o password.", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Mali ang email o password.", 401);

    return successResponse(res, "Matagumpay na nag-login!", {
      accessToken: generateAccessToken(user.id, user.role),
      refreshToken: generateRefreshToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return errorResponse(res, "May error sa pag-login.");
  }
});

// POST /api/auth/refresh
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return errorResponse(res, "Walang refresh token.", 401);

  const stored = refreshTokenStore.get(refreshToken);
  if (!stored) return errorResponse(res, "Hindi valid ang refresh token. Mag-login ulit.", 403);

  refreshTokenStore.delete(refreshToken);
  return successResponse(res, "Na-refresh ang session.", {
    accessToken: generateAccessToken(stored.userId, stored.role),
    refreshToken: generateRefreshToken(stored.userId, stored.role),
  });
});

// GET /api/auth/me
router.get("/me", verifyToken, (req, res) => {
  // PALITAN: const user = await User.findById(req.user.id).select("-password")
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return errorResponse(res, "Hindi mahanap ang user.", 404);
  const { password, ...userWithoutPassword } = user;
  return successResponse(res, "Nakuha ang profile.", userWithoutPassword);
});

// POST /api/auth/logout
router.post("/logout", verifyToken, (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokenStore.delete(refreshToken);
  return successResponse(res, "Matagumpay na nag-logout!");
});

module.exports = router;
```

**Sa `server.js` idagdag:**
```javascript
app.use("/api/auth", require("./routes/auth"));
```

**Mga endpoints:**
```
POST   /api/auth/register    — Gumawa ng account
POST   /api/auth/login       — Mag-login, makuha ang token
POST   /api/auth/refresh     — Kumuha ng bagong access token
GET    /api/auth/me          — Tingnan ang sariling profile  🔒
POST   /api/auth/logout      — Mag-logout                   🔒
```

---

---

# ✅ USERS API — `routes/users.js`
### Tingnan · I-edit · I-delete ang mga Users

```javascript
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// PALITAN NG TUNAY NA DATABASE
let users = [
  { id: "1", name: "Juan Dela Cruz", email: "juan@example.com", role: "user" },
  { id: "2", name: "Maria Santos", email: "maria@example.com", role: "admin" },
];

// GET /api/users — Lahat ng users (Admin only)
router.get("/", verifyAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // PALITAN: const users = await User.find().select("-password").skip((page-1)*limit).limit(limit)
    return paginatedResponse(res, "Nakuha ang lahat ng users.", users.slice((page-1)*limit, page*limit), { total: users.length, page, limit });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng users."); }
});

// GET /api/users/:id — Isang user
router.get("/:id", verifyToken, (req, res) => {
  try {
    // PALITAN: const user = await User.findById(req.params.id).select("-password")
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return errorResponse(res, "Hindi mahanap ang user.", 404);
    return successResponse(res, "Nakuha ang user.", user);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng user."); }
});

// PUT /api/users/:id — I-update ang user (sarili o admin)
router.put("/:id", verifyToken, (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin")
      return errorResponse(res, "Hindi ka pwedeng mag-edit ng ibang user.", 403);

    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang user.", 404);

    const { name, email } = req.body;
    // PALITAN: await User.findByIdAndUpdate(req.params.id, { name, email }, { new: true })
    users[index] = { ...users[index], name: name || users[index].name, email: email || users[index].email };
    return successResponse(res, "Na-update ang user.", users[index]);
  } catch (err) { return errorResponse(res, "May error sa pag-update ng user."); }
});

// DELETE /api/users/:id — Burahin ang user (Admin only)
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang user.", 404);
    // PALITAN: await User.findByIdAndDelete(req.params.id)
    users.splice(index, 1);
    return successResponse(res, "Nabura ang user.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng user."); }
});

module.exports = router;
```

**Sa `server.js` idagdag:**
```javascript
app.use("/api/users", require("./routes/users"));
```

**Mga endpoints:**
```
GET    /api/users            — Lahat ng users          🔒 Admin only
GET    /api/users/:id        — Isang user              🔒 Login required
PUT    /api/users/:id        — I-edit ang user         🔒 Sarili o Admin
DELETE /api/users/:id        — Burahin ang user        🔒 Admin only
```

---

---

# ✅ PRODUCTS API — `routes/products.js`
### CRUD ng mga Produkto · May Search at Paginate

```javascript
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// PALITAN NG TUNAY NA DATABASE
let products = [
  { id: "1", name: "Laptop", price: 45000, category: "electronics", stock: 10 },
  { id: "2", name: "Mouse", price: 800, category: "electronics", stock: 50 },
];

// GET /api/products — Lahat ng products (public, walang login)
router.get("/", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    // PALITAN: const products = await Product.find({ name: { $regex: search, $options: 'i' } }).skip(...).limit(...)
    const filtered = search ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) : products;
    return paginatedResponse(res, "Nakuha ang mga produkto.", filtered.slice((page-1)*limit, page*limit), { total: filtered.length, page, limit });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng products."); }
});

// GET /api/products/:id — Isang product (public)
router.get("/:id", (req, res) => {
  try {
    // PALITAN: const product = await Product.findById(req.params.id)
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return errorResponse(res, "Hindi mahanap ang produkto.", 404);
    return successResponse(res, "Nakuha ang produkto.", product);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng produkto."); }
});

// POST /api/products — Gumawa ng product (Admin only)
router.post("/", verifyAdmin, (req, res) => {
  try {
    const { name, price, category, stock } = req.body;
    if (!name || !price) return errorResponse(res, "Kailangan ang name at price.", 400);
    // PALITAN: const product = await Product.create({ name, price, category, stock })
    const newProduct = { id: Date.now().toString(), name, price: parseFloat(price), category: category || "uncategorized", stock: parseInt(stock) || 0, createdAt: new Date() };
    products.push(newProduct);
    return successResponse(res, "Nagawa ang bagong produkto.", newProduct, 201);
  } catch (err) { return errorResponse(res, "May error sa paggawa ng produkto."); }
});

// PUT /api/products/:id — I-update ang product (Admin only)
router.put("/:id", verifyAdmin, (req, res) => {
  try {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang produkto.", 404);
    // PALITAN: const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    products[index] = { ...products[index], ...req.body, id: req.params.id };
    return successResponse(res, "Na-update ang produkto.", products[index]);
  } catch (err) { return errorResponse(res, "May error sa pag-update ng produkto."); }
});

// DELETE /api/products/:id — Burahin (Admin only)
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang produkto.", 404);
    // PALITAN: await Product.findByIdAndDelete(req.params.id)
    products.splice(index, 1);
    return successResponse(res, "Nabura ang produkto.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng produkto."); }
});

module.exports = router;
```

**Sa `server.js` idagdag:**
```javascript
app.use("/api/products", require("./routes/products"));
```

**Mga endpoints:**
```
GET    /api/products         — Lahat ng produkto (may search) 🌐 Public
GET    /api/products/:id     — Isang produkto                 🌐 Public
POST   /api/products         — Gumawa ng produkto             🔒 Admin only
PUT    /api/products/:id     — I-edit ang produkto            🔒 Admin only
DELETE /api/products/:id     — Burahin ang produkto           🔒 Admin only
```

---

---

# ✅ POSTS API — `routes/posts.js`
### Blog · Articles · News · May Likes

```javascript
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// PALITAN NG TUNAY NA DATABASE
let posts = [
  { id: "1", title: "Unang Post", content: "Hello World!", authorId: "1", likes: 0, createdAt: new Date() },
];

// GET /api/posts — Lahat ng posts (public)
router.get("/", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    // PALITAN: const posts = await Post.find({ title: { $regex: search, $options: 'i' } }).sort("-createdAt").skip(...).limit(...)
    const filtered = search ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())) : posts;
    return paginatedResponse(res, "Nakuha ang mga post.", filtered.slice((page-1)*limit, page*limit), { total: filtered.length, page, limit });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng mga post."); }
});

// GET /api/posts/:id — Isang post (public)
router.get("/:id", (req, res) => {
  try {
    // PALITAN: const post = await Post.findById(req.params.id)
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) return errorResponse(res, "Hindi mahanap ang post.", 404);
    return successResponse(res, "Nakuha ang post.", post);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng post."); }
});

// POST /api/posts — Gumawa ng post (kailangan ng login)
router.post("/", verifyToken, (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return errorResponse(res, "Kailangan ang title at content.", 400);
    // PALITAN: const post = await Post.create({ title, content, authorId: req.user.id })
    const newPost = { id: Date.now().toString(), title, content, authorId: req.user.id, likes: 0, createdAt: new Date() };
    posts.push(newPost);
    return successResponse(res, "Nagawa ang bagong post.", newPost, 201);
  } catch (err) { return errorResponse(res, "May error sa paggawa ng post."); }
});

// PUT /api/posts/:id — I-edit (author o admin lang)
router.put("/:id", verifyToken, (req, res) => {
  try {
    const index = posts.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang post.", 404);
    if (posts[index].authorId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Ikaw lang ang pwedeng mag-edit ng iyong post.", 403);
    // PALITAN: await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    posts[index] = { ...posts[index], ...req.body, id: req.params.id, authorId: posts[index].authorId };
    return successResponse(res, "Na-update ang post.", posts[index]);
  } catch (err) { return errorResponse(res, "May error sa pag-edit ng post."); }
});

// POST /api/posts/:id/like — I-like ang post
router.post("/:id/like", verifyToken, (req, res) => {
  try {
    // PALITAN: await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } })
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) return errorResponse(res, "Hindi mahanap ang post.", 404);
    post.likes += 1;
    return successResponse(res, "Na-like ang post!", { likes: post.likes });
  } catch (err) { return errorResponse(res, "May error sa pag-like."); }
});

// DELETE /api/posts/:id — Burahin (author o admin)
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = posts.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang post.", 404);
    if (posts[index].authorId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong post.", 403);
    // PALITAN: await Post.findByIdAndDelete(req.params.id)
    posts.splice(index, 1);
    return successResponse(res, "Nabura ang post.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng post."); }
});

module.exports = router;
```

**Sa `server.js` idagdag:**
```javascript
app.use("/api/posts", require("./routes/posts"));
```

**Mga endpoints:**
```
GET    /api/posts            — Lahat ng posts (may search)    🌐 Public
GET    /api/posts/:id        — Isang post                     🌐 Public
POST   /api/posts            — Gumawa ng post                 🔒 Login required
PUT    /api/posts/:id        — I-edit ang post                🔒 Author o Admin
POST   /api/posts/:id/like   — I-like ang post               🔒 Login required
DELETE /api/posts/:id        — Burahin ang post               🔒 Author o Admin
```

---

---

# ✅ ORDERS API — `routes/orders.js`
### E-commerce Orders · Status Tracking

```javascript
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// PALITAN NG TUNAY NA DATABASE
let orders = [
  { id: "1", userId: "1", items: [{ productId: "1", name: "Laptop", qty: 1, price: 45000 }], total: 45000, status: "pending", createdAt: new Date() },
];

// GET /api/orders — Sariling orders (admin nakakakita ng lahat)
router.get("/", verifyToken, (req, res) => {
  try {
    // PALITAN: const orders = req.user.role === 'admin' ? await Order.find() : await Order.find({ userId: req.user.id })
    const filtered = req.user.role === "admin" ? orders : orders.filter((o) => o.userId === req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    return paginatedResponse(res, "Nakuha ang mga order.", filtered.slice((page-1)*limit, page*limit), { total: filtered.length, page, limit });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng mga order."); }
});

// GET /api/orders/:id — Isang order
router.get("/:id", verifyToken, (req, res) => {
  try {
    // PALITAN: const order = await Order.findById(req.params.id)
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) return errorResponse(res, "Hindi mahanap ang order.", 404);
    if (order.userId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Wala kang access sa order na ito.", 403);
    return successResponse(res, "Nakuha ang order.", order);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng order."); }
});

// POST /api/orders — Gumawa ng order
router.post("/", verifyToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      return errorResponse(res, "Kailangan ng hindi empty na items array.", 400);
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    // PALITAN: const order = await Order.create({ userId: req.user.id, items, total, status: 'pending' })
    const newOrder = { id: Date.now().toString(), userId: req.user.id, items, total, status: "pending", createdAt: new Date() };
    orders.push(newOrder);
    return successResponse(res, "Nagawa ang order!", newOrder, 201);
  } catch (err) { return errorResponse(res, "May error sa paggawa ng order."); }
});

// PATCH /api/orders/:id/status — I-update ang status (Admin only)
router.patch("/:id/status", verifyAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status))
      return errorResponse(res, `Invalid status. Gamitin ang: ${validStatuses.join(", ")}`, 400);
    // PALITAN: const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) return errorResponse(res, "Hindi mahanap ang order.", 404);
    order.status = status;
    return successResponse(res, `Na-update ang status sa "${status}".`, order);
  } catch (err) { return errorResponse(res, "May error sa pag-update ng status."); }
});

// DELETE /api/orders/:id — Burahin ang order (Admin only)
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    const index = orders.findIndex((o) => o.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang order.", 404);
    // PALITAN: await Order.findByIdAndDelete(req.params.id)
    orders.splice(index, 1);
    return successResponse(res, "Nabura ang order.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng order."); }
});

module.exports = router;
```

**Sa `server.js` idagdag:**
```javascript
app.use("/api/orders", require("./routes/orders"));
```

**Mga endpoints:**
```
GET    /api/orders               — Sariling orders (admin = lahat) 🔒 Login required
GET    /api/orders/:id           — Isang order                     🔒 Login required
POST   /api/orders               — Gumawa ng order                 🔒 Login required
PATCH  /api/orders/:id/status    — I-update ang status             🔒 Admin only
DELETE /api/orders/:id           — Burahin ang order               🔒 Admin only
```

---

---

# ✅ FILES API — `routes/files.js`
### Upload ng Images at Files

```javascript
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config/config");
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(config.UPLOAD.DEST)) fs.mkdirSync(config.UPLOAD.DEST, { recursive: true });
    cb(null, config.UPLOAD.DEST);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
  },
});

const fileFilter = (req, file, cb) => {
  config.UPLOAD.ALLOWED_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error(`Hindi allowed ang "${file.mimetype}".`), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: config.UPLOAD.MAX_SIZE } });

// POST /api/files/upload — Mag-upload ng isang file
router.post("/upload", verifyToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "Walang na-upload na file.", 400);
    return successResponse(res, "Na-upload ang file!", {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    }, 201);
  } catch (err) { return errorResponse(res, "May error sa pag-upload."); }
});

// POST /api/files/upload-multiple — Maraming files (max 5)
router.post("/upload-multiple", verifyToken, upload.array("files", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return errorResponse(res, "Walang na-upload na files.", 400);
    const filesData = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    }));
    return successResponse(res, `${filesData.length} files ang na-upload!`, filesData, 201);
  } catch (err) { return errorResponse(res, "May error sa pag-upload ng files."); }
});

// DELETE /api/files/:filename — Burahin ang file
router.delete("/:filename", verifyToken, (req, res) => {
  try {
    const filePath = path.join(config.UPLOAD.DEST, req.params.filename);
    if (!fs.existsSync(filePath)) return errorResponse(res, "Hindi mahanap ang file.", 404);
    fs.unlinkSync(filePath);
    return successResponse(res, "Nabura ang file.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng file."); }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE")
    return errorResponse(res, `Sobrang laki ng file. Max: ${config.UPLOAD.MAX_SIZE / 1024 / 1024}MB.`, 400);
  return errorResponse(res, err.message || "May error sa file upload.", 400);
});

module.exports = router;
```

**Sa `server.js` idagdag:**
```javascript
app.use("/api/files", require("./routes/files"));
```

**Mga endpoints:**
```
POST   /api/files/upload          — Mag-upload ng 1 file      🔒 Login required
POST   /api/files/upload-multiple — Mag-upload ng marami       🔒 Login required
DELETE /api/files/:filename       — Burahin ang file           🔒 Login required
```

---

---

# ✅ NOTIFICATIONS API — `routes/notifications.js`
### In-app Notifications · Read/Unread

```javascript
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// PALITAN NG TUNAY NA DATABASE
let notifications = [
  { id: "1", userId: "1", message: "Maligayang pagdating!", isRead: false, createdAt: new Date() },
  { id: "2", userId: "1", message: "May bagong order ka!", isRead: false, createdAt: new Date() },
];

// GET /api/notifications — Lahat ng notif ng naka-login
router.get("/", verifyToken, (req, res) => {
  try {
    // PALITAN: const notifs = await Notification.find({ userId: req.user.id }).sort("-createdAt")
    const userNotifs = notifications.filter((n) => n.userId === req.user.id);
    return successResponse(res, "Nakuha ang mga notipikasyon.", {
      notifications: userNotifs,
      unreadCount: userNotifs.filter((n) => !n.isRead).length,
    });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng notifications."); }
});

// PATCH /api/notifications/:id/read — Markahan bilang nabasa
router.patch("/:id/read", verifyToken, (req, res) => {
  try {
    // PALITAN: await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { isRead: true })
    const notif = notifications.find((n) => n.id === req.params.id && n.userId === req.user.id);
    if (!notif) return errorResponse(res, "Hindi mahanap ang notipikasyon.", 404);
    notif.isRead = true;
    return successResponse(res, "Nabasa na ang notipikasyon.", notif);
  } catch (err) { return errorResponse(res, "May error sa pag-mark ng notipikasyon."); }
});

// PATCH /api/notifications/read-all — Markahan lahat bilang nabasa
router.patch("/read-all", verifyToken, (req, res) => {
  try {
    // PALITAN: await Notification.updateMany({ userId: req.user.id }, { isRead: true })
    notifications.filter((n) => n.userId === req.user.id).forEach((n) => (n.isRead = true));
    return successResponse(res, "Lahat ng notipikasyon ay nabasa na.");
  } catch (err) { return errorResponse(res, "May error sa pag-mark ng lahat."); }
});

// DELETE /api/notifications/:id — Burahin ang notif
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = notifications.findIndex((n) => n.id === req.params.id && n.userId === req.user.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang notipikasyon.", 404);
    // PALITAN: await Notification.findByIdAndDelete(req.params.id)
    notifications.splice(index, 1);
    return successResponse(res, "Nabura ang notipikasyon.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng notipikasyon."); }
});

module.exports = router;
```

**Sa `server.js` idagdag:**
```javascript
app.use("/api/notifications", require("./routes/notifications"));
```

**Mga endpoints:**
```
GET    /api/notifications            — Lahat ng notif + unread count 🔒 Login required
PATCH  /api/notifications/:id/read   — Markahan bilang nabasa        🔒 Login required
PATCH  /api/notifications/read-all   — Markahan lahat nabasa         🔒 Login required
DELETE /api/notifications/:id        — Burahin ang notif             🔒 Login required
```

---

---

# COMPLETE `server.js` — Lahat ng APIs

Kopyahin ito at **alisin lang ang mga linya ng API na hindi mo ginagamit:**

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const config = require("./config/config");
const { generalLimiter, speedLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(speedLimiter);
app.use(generalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server tumatakbo!", timestamp: new Date().toISOString() });
});

// ↓↓↓ ALISIN ANG HINDI MO KAILANGAN ↓↓↓
app.use("/api/auth",          require("./routes/auth"));          // KAILANGAN PALAGI
app.use("/api/users",         require("./routes/users"));         // USERS API
app.use("/api/products",      require("./routes/products"));      // PRODUCTS API
app.use("/api/posts",         require("./routes/posts"));         // POSTS API
app.use("/api/orders",        require("./routes/orders"));        // ORDERS API
app.use("/api/files",         require("./routes/files"));         // FILES API
app.use("/api/notifications", require("./routes/notifications")); // NOTIFICATIONS API
// ↑↑↑ ALISIN ANG HINDI MO KAILANGAN ↑↑↑

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Hindi mahanap: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "May error." });
});

app.listen(config.PORT, () => {
  console.log(`\n  SERVER: http://localhost:${config.PORT}`);
  console.log(`  HEALTH: http://localhost:${config.PORT}/health\n`);
});

module.exports = app;
```

---

# LEGEND

```
🌐 Public     — Walang kailangan na token, kahit sino makaka-access
🔒 Login      — Kailangan ng accessToken sa Authorization header
🔒 Admin only — Kailangan ng account na may role: "admin"
```

**Paano mag-send ng token sa Postman:**
```
Headers:
  Authorization: Bearer eyJhbGci...   ← i-paste ang accessToken dito
```
