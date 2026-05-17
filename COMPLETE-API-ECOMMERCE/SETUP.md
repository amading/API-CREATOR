# COMPLETE-API-ECOMMERCE — Online Shop API

## HAKBANG 1 — Install
```bash
npm install
```

## HAKBANG 2 — .env
```bash
copy .env.example .env
```
Generate keys:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

## HAKBANG 3 — Run
```bash
node server.js
```

---

## LAHAT NG ENDPOINTS

### AUTH
```
POST   /api/auth/register              Mag-register
POST   /api/auth/login                 Mag-login → makuha ang token
POST   /api/auth/refresh               I-refresh ang token
GET    /api/auth/me                 🔒 Sariling profile
POST   /api/auth/logout             🔒 Mag-logout
```

### PROFILE
```
GET    /api/profile                 🔒 Tingnan ang profile
PUT    /api/profile                 🔒 I-edit ang profile
PUT    /api/profile/password        🔒 Palitan ang password
POST   /api/profile/avatar          🔒 Mag-upload ng avatar
```

### CATEGORIES
```
GET    /api/categories                 Lahat ng kategorya (public)
GET    /api/categories/:slug           Isang kategorya (public)
POST   /api/categories              🔒 Gumawa (admin only)
PUT    /api/categories/:id          🔒 I-edit (admin only)
DELETE /api/categories/:id          🔒 Burahin (admin only)
```

### PRODUCTS
```
GET    /api/products                   Lahat ng produkto (public)
GET    /api/products/:id               Isang produkto (public)
POST   /api/products                🔒 Gumawa (admin only)
PUT    /api/products/:id            🔒 I-edit (admin only)
DELETE /api/products/:id            🔒 Burahin (admin only)
```

### CART
```
GET    /api/cart                    🔒 Tingnan ang cart
POST   /api/cart                    🔒 Magdagdag ng item
PUT    /api/cart/:productId         🔒 I-update ang qty
DELETE /api/cart/:productId         🔒 Alisin ang item
DELETE /api/cart                    🔒 I-clear ang buong cart
```

### ORDERS
```
GET    /api/orders                  🔒 Sariling orders
GET    /api/orders/:id              🔒 Isang order
POST   /api/orders                  🔒 Gumawa ng order
PATCH  /api/orders/:id/status       🔒 I-update status (admin)
DELETE /api/orders/:id              🔒 Burahin (admin)
```

### FAVORITES / RATINGS
```
GET    /api/favorites               🔒 Wishlist
POST   /api/favorites               🔒 I-save ang item
DELETE /api/favorites/:itemId       🔒 Alisin

GET    /api/ratings?itemId=1           Ratings ng produkto (public)
POST   /api/ratings                 🔒 Mag-rate
PUT    /api/ratings/:id             🔒 I-edit ang rating
```

### MOBILE
```
GET    /api/notifications           🔒 Mga notifications
POST   /api/device-tokens           🔒 I-register ang device
GET    /api/settings                🔒 Settings
PUT    /api/settings                🔒 I-update ang settings
POST   /api/files/upload            🔒 Mag-upload ng larawan
```
