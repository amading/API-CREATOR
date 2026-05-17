# COMPLETE-API-BASIC — Simple GET · POST · PUT · PATCH · DELETE

## SETUP — 3 hakbang lang

### 1. Install
```bash
npm install
```

### 2. .env
```bash
copy .env.example .env
```
I-run para sa keys:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run
```bash
node server.js
```

---

## LAHAT NG ENDPOINTS

### AUTH — Para makakuha ng token
```
POST  /api/auth/register     Mag-register
POST  /api/auth/login        Mag-login → makuha ang token
POST  /api/auth/refresh      I-refresh ang token
GET   /api/auth/me        🔒 Sariling profile
POST  /api/auth/logout    🔒 Mag-logout
```

### ITEMS — Basic CRUD
```
GET    /api/items           🔒 Lahat ng items (may search + paginate)
GET    /api/items/:id       🔒 Isang item
POST   /api/items           🔒 Gumawa ng bagong item
PUT    /api/items/:id       🔒 I-update lahat ng fields
PATCH  /api/items/:id       🔒 I-update ilang fields lang
DELETE /api/items/:id       🔒 Burahin ang item
```

---

## DIFFERENCE NG PUT AT PATCH

```
PUT   → Kailangan ipadala LAHAT ng fields, palitan ang buong item
PATCH → Pwedeng ipadala ilan lang na fields, ang iba ay hindi mababago
```

**PUT example:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active"
}
```

**PATCH example (status lang ang babaguhin):**
```json
{
  "status": "inactive"
}
```

---

## SUBUKAN SA POSTMAN

### Step 1 — Mag-register
```
POST  http://localhost:3000/api/auth/register
Body:
{
  "name": "Juan",
  "email": "juan@test.com",
  "password": "password123"
}
```

### Step 2 — I-copy ang accessToken sa response

### Step 3 — Gamitin ang token sa lahat ng requests
```
Headers:
  Authorization: Bearer <accessToken>
```

### GET lahat ng items (may search)
```
GET  http://localhost:3000/api/items
GET  http://localhost:3000/api/items?search=one
GET  http://localhost:3000/api/items?status=active
GET  http://localhost:3000/api/items?page=1&limit=5
```

### GET isang item
```
GET  http://localhost:3000/api/items/1
```

### POST — Gumawa ng item
```
POST  http://localhost:3000/api/items
Body:
{
  "name": "Bagong Item",
  "description": "Deskripsyon dito",
  "status": "active"
}
```

### PUT — I-update lahat ng fields
```
PUT   http://localhost:3000/api/items/1
Body:
{
  "name": "Na-update na Pangalan",
  "description": "Na-update na description",
  "status": "inactive"
}
```

### PATCH — I-update isang field lang
```
PATCH  http://localhost:3000/api/items/1
Body:
{
  "status": "inactive"
}
```

### DELETE — Burahin
```
DELETE  http://localhost:3000/api/items/1
```

---

## PAANO I-RENAME PARA SA SARILING PROJECT

Halimbawa gusto mong "products" na ang pangalan:

**1. I-rename ang file:**
```
routes/items.js  →  routes/products.js
```

**2. I-edit ang fields sa loob ng file:**
```javascript
// Palitan ang items ng products sa dummy data
let products = [
  { id: "1", name: "Laptop", price: 45000, stock: 10 }
];

// Palitan ang fields sa POST at PUT
const { name, price, stock } = req.body;
```

**3. I-update sa server.js:**
```javascript
app.use("/api/products", require("./routes/products"));
```

---

## QUERY PARAMETERS

| Parameter | Gamit | Example |
|---|---|---|
| `search` | Maghanap sa name/description | `?search=laptop` |
| `status` | Filter by status | `?status=active` |
| `page` | Numero ng page | `?page=2` |
| `limit` | Bilang ng items per page | `?limit=5` |

---

> Lahat ng endpoints ay may JWT + AES-256-GCM encryption na.
