# COMPLETE API — Setup Guide
### Kopyahin ang buong folder na ito. Tapos na!

---

## HAKBANG 1 — I-install ang packages
```bash
npm install
```

---

## HAKBANG 2 — Gumawa ng `.env` file
```bash
copy .env.example .env
```

Buksan ang `.env` at i-run ang bawat command para sa keys:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```
I-copy ang output ng bawat isa → i-paste sa `.env`

---

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## HAKBANG 4 — Subukan
```
GET  http://localhost:3000/health
```
Dapat mag-reply ng `"Server tumatakbo!"`

---

## LAHAT NG ENDPOINTS

### AUTH
```
POST   /api/auth/register       Gumawa ng account
POST   /api/auth/login          Mag-login → makuha ang token
POST   /api/auth/refresh        Kumuha ng bagong token
GET    /api/auth/me          🔒 Tingnan ang sariling profile
POST   /api/auth/logout      🔒 Mag-logout
```

### PROFILE
```
GET    /api/profile          🔒 Tingnan ang profile
PUT    /api/profile          🔒 I-edit ang name, bio
PUT    /api/profile/password 🔒 Palitan ang password
POST   /api/profile/avatar   🔒 Mag-upload ng profile picture
```

### USERS
```
GET    /api/users            🔒 Lahat ng users (admin only)
GET    /api/users/:id        🔒 Isang user
PUT    /api/users/:id        🔒 I-edit (sarili o admin)
DELETE /api/users/:id        🔒 Burahin (admin only)
```

### PRODUCTS
```
GET    /api/products             Lahat ng produkto (public)
GET    /api/products/:id         Isang produkto (public)
POST   /api/products         🔒 Gumawa (admin only)
PUT    /api/products/:id     🔒 I-edit (admin only)
DELETE /api/products/:id     🔒 Burahin (admin only)
```

### POSTS
```
GET    /api/posts                Lahat ng posts (public)
GET    /api/posts/:id            Isang post (public)
POST   /api/posts            🔒 Gumawa ng post
PUT    /api/posts/:id        🔒 I-edit (author o admin)
POST   /api/posts/:id/like   🔒 I-like
DELETE /api/posts/:id        🔒 Burahin (author o admin)
```

### COMMENTS
```
GET    /api/comments?postId=1    Lahat ng comments (public)
POST   /api/comments         🔒 Mag-comment
PUT    /api/comments/:id     🔒 I-edit (author o admin)
POST   /api/comments/:id/like 🔒 I-like ang comment
DELETE /api/comments/:id     🔒 Burahin (author o admin)
```

### RATINGS
```
GET    /api/ratings?itemId=1     Lahat ng ratings + average (public)
POST   /api/ratings          🔒 Mag-rate (1-5 stars)
PUT    /api/ratings/:id      🔒 I-edit ang sariling rating
DELETE /api/ratings/:id      🔒 Burahin
```

### ORDERS
```
GET    /api/orders           🔒 Sariling orders
GET    /api/orders/:id       🔒 Isang order
POST   /api/orders           🔒 Gumawa ng order
PATCH  /api/orders/:id/status 🔒 I-update status (admin only)
DELETE /api/orders/:id       🔒 Burahin (admin only)
```

### FAVORITES
```
GET    /api/favorites         🔒 Lahat ng paborito
POST   /api/favorites         🔒 Idagdag sa paborito
GET    /api/favorites/check/:itemId 🔒 Tingnan kung paborito na
DELETE /api/favorites/:itemId 🔒 Alisin sa paborito
```

### MESSAGES
```
GET    /api/messages/inbox    🔒 Lahat ng conversations
GET    /api/messages/:userId  🔒 Conversation kasama ang user
POST   /api/messages          🔒 Mag-send ng message
DELETE /api/messages/:id      🔒 Burahin ang message
```

### NOTIFICATIONS
```
GET    /api/notifications          🔒 Lahat ng notif + unread count
PATCH  /api/notifications/:id/read 🔒 Markahan bilang nabasa
PATCH  /api/notifications/read-all 🔒 Markahan lahat nabasa
DELETE /api/notifications/:id      🔒 Burahin ang notif
```

### DEVICE TOKENS
```
POST   /api/device-tokens     🔒 I-register ang device (after login)
GET    /api/device-tokens     🔒 Lahat ng devices
DELETE /api/device-tokens     🔒 Alisin ang device (before logout)
```

### SETTINGS
```
GET    /api/settings          🔒 Kunin ang settings
PUT    /api/settings          🔒 I-update ang settings
PUT    /api/settings/notifications 🔒 I-update ang notif settings
DELETE /api/settings          🔒 I-reset sa default
```

### FILES
```
POST   /api/files/upload           🔒 Mag-upload ng 1 file
POST   /api/files/upload-multiple  🔒 Mag-upload ng marami (max 5)
DELETE /api/files/:filename        🔒 Burahin ang file
```

---

## TANGGALIN ANG HINDI KAILANGAN

Buksan ang `server.js` at i-comment out ang mga route na hindi mo gagamitin:

```javascript
// app.use("/api/orders",    require("./routes/orders"));    // ← idagdag // para hindi aktibo
// app.use("/api/favorites", require("./routes/favorites")); // ← ganito rin
```

---

## LEGEND
```
🔒 = Kailangan ng token sa Authorization header
     Authorization: Bearer <accessToken>

Walang 🔒 = Public, kahit sino makaka-access
```
