# PICK YOUR API — Piliin, Kopyahin, Tapos na!

## PAANO GAMITIN — 3 hakbang lang

```
1. Pumili ng API folder
2. Kopyahin ang .js file  →  ilagay sa routes/ folder
3. Buksan ang SETUP.md    →  sundin ang 3 hakbang doon
```

---

## LAHAT NG AVAILABLE NA API

### CORE — Pangunahing APIs
| Folder | Gamit |
|---|---|
| AUTH | Register · Login · Logout · Refresh Token |
| USERS | Manage users · Admin tools |
| PROFILE | Edit profile · Change password · Upload avatar |

### CONTENT — Para sa content-based apps
| Folder | Gamit |
|---|---|
| PRODUCTS | CRUD ng produkto · May search |
| POSTS | Blog/articles · May likes |
| COMMENTS | Mag-comment sa posts o products |
| RATINGS | Star rating ng items |

### E-COMMERCE — Para sa online shop
| Folder | Gamit |
|---|---|
| ORDERS | Order management · Status tracking |
| FAVORITES | Wishlist · Save items |

### MOBILE — Para sa mobile apps
| Folder | Gamit |
|---|---|
| MESSAGES | Direct messages · Chat |
| NOTIFICATIONS | In-app notifications |
| DEVICE-TOKENS | Push notifications (FCM/APNs) |
| SETTINGS | User preferences · Theme · Language |
| FILES | Upload images at files |

---

## KAILANGAN PALAGI — AUTH

```
AUTH folder ay kailangan sa LAHAT ng API.
Palaging i-copy ang AUTH/auth.js → routes/auth.js
```

---

## HALIMBAWA — Social Media App

```
Kopyahin:
  AUTH/auth.js              →  routes/auth.js
  PROFILE/profile.js        →  routes/profile.js
  POSTS/posts.js            →  routes/posts.js
  COMMENTS/comments.js      →  routes/comments.js
  MESSAGES/messages.js      →  routes/messages.js
  NOTIFICATIONS/notifications.js → routes/notifications.js
  DEVICE-TOKENS/device-tokens.js → routes/device-tokens.js
  SETTINGS/settings.js      →  routes/settings.js

Sa server.js:
  app.use("/api/auth",          require("./routes/auth"));
  app.use("/api/profile",       require("./routes/profile"));
  app.use("/api/posts",         require("./routes/posts"));
  app.use("/api/comments",      require("./routes/comments"));
  app.use("/api/messages",      require("./routes/messages"));
  app.use("/api/notifications", require("./routes/notifications"));
  app.use("/api/device-tokens", require("./routes/device-tokens"));
  app.use("/api/settings",      require("./routes/settings"));
```

## HALIMBAWA — E-commerce App

```
Kopyahin:
  AUTH/auth.js              →  routes/auth.js
  PROFILE/profile.js        →  routes/profile.js
  PRODUCTS/products.js      →  routes/products.js
  ORDERS/orders.js          →  routes/orders.js
  FAVORITES/favorites.js    →  routes/favorites.js
  RATINGS/ratings.js        →  routes/ratings.js
  NOTIFICATIONS/notifications.js → routes/notifications.js
  DEVICE-TOKENS/device-tokens.js → routes/device-tokens.js
  FILES/files.js            →  routes/files.js

Sa server.js:
  app.use("/api/auth",          require("./routes/auth"));
  app.use("/api/profile",       require("./routes/profile"));
  app.use("/api/products",      require("./routes/products"));
  app.use("/api/orders",        require("./routes/orders"));
  app.use("/api/favorites",     require("./routes/favorites"));
  app.use("/api/ratings",       require("./routes/ratings"));
  app.use("/api/notifications", require("./routes/notifications"));
  app.use("/api/device-tokens", require("./routes/device-tokens"));
  app.use("/api/files",         require("./routes/files"));
```

## HALIMBAWA — Blog/News App

```
Kopyahin:
  AUTH/auth.js              →  routes/auth.js
  POSTS/posts.js            →  routes/posts.js
  COMMENTS/comments.js      →  routes/comments.js
  RATINGS/ratings.js        →  routes/ratings.js
  FILES/files.js            →  routes/files.js

Sa server.js:
  app.use("/api/auth",     require("./routes/auth"));
  app.use("/api/posts",    require("./routes/posts"));
  app.use("/api/comments", require("./routes/comments"));
  app.use("/api/ratings",  require("./routes/ratings"));
  app.use("/api/files",    require("./routes/files"));
```

---

> Lahat ng API ay may JWT + AES-256-GCM encryption na.
> Hindi na kailangan pang mag-setup ng security.
