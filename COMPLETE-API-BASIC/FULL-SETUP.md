# FULL SETUP GUIDE — COMPLETE-API-BASIC
### Sundin ito ng sunod — guaranteed working

---

# BAHAGI 1 — I-SETUP ANG PROJECT

---

## HAKBANG 1 — Buksan ang terminal sa tamang folder

Sa VS Code:
- I-click ang **Terminal** sa menu bar sa taas
- I-click ang **New Terminal**
- Dapat makita mo ito sa ibaba:
```
PS C:\...\COMPLETE-API-BASIC>
```

---

## HAKBANG 2 — I-install ang packages

```bash
npm install
```

Hintayin mong matapos. Dapat makita mo:
```
added 120 packages...
```

---

## HAKBANG 3 — Gumawa ng .env file

I-run ito sa terminal:
```bash
copy .env.example .env
```

---

## HAKBANG 4 — Generate ng mga Secret Keys

I-run ang bawat command — i-copy ang output, i-paste sa .env

**Para sa JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Para sa JWT_REFRESH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Para sa JWT_ENCRYPTION_KEY:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## HAKBANG 5 — I-edit ang .env file

Buksan ang `.env` file sa VS Code. Dapat ganito ang hitsura:
```
PORT=3000
DATABASE_URL=mongodb://localhost:27017/mydb

JWT_SECRET=<i-paste dito ang output ng command 1>
JWT_REFRESH_SECRET=<i-paste dito ang output ng command 2>
JWT_ENCRYPTION_KEY=<i-paste dito ang output ng command 3>

CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**MAHALAGA — Bawat key ay isang linya lang, walang duplicate:**
```
✓ TAMA:   JWT_SECRET=abc123...
✗ MALI:   JWT_SECRET=JWT_SECRET=abc123...
```

I-save ang file (Ctrl+S).

---

## HAKBANG 6 — I-start ang server

```bash
node server.js
```

Dapat makita mo ito:
```
================================================
  SERVER: http://localhost:3000
  HEALTH: http://localhost:3000/health
================================================
  ENDPOINTS:
  GET    /api/items
  GET    /api/items/:id
  POST   /api/items
  PUT    /api/items/:id
  PATCH  /api/items/:id
  DELETE /api/items/:id
================================================
```

**Server tumatakbo na!** Huwag isara ang terminal.

---

---

# BAHAGI 2 — I-TEST SA POSTMAN

---

## HAKBANG 7 — Buksan ang Postman, gumawa ng bagong request

1. Buksan ang Postman
2. I-click ang **"New"** button (upper left)
3. Piliin ang **"HTTP"**
4. Makikita mo ang URL bar sa taas

---

## HAKBANG 8 — REGISTER (para makakuha ng token)

**Itakda:**
```
Method : POST
URL    : http://localhost:3000/api/auth/register
```

**I-click ang Body tab:**
- Piliin ang **raw**
- Piliin ang **JSON** sa dropdown sa kanan

**I-type ang:**
```json
{
    "name": "Juan dela Cruz",
    "email": "juan@test.com",
    "password": "password123"
}
```

**I-click ang Send.**

**Response dapat:**
```json
{
    "success": true,
    "message": "Matagumpay na nagrehistro!",
    "data": {
        "accessToken": "eyJhbGci...",
        "refreshToken": "a3f9bc2d...",
        "user": {
            "name": "Juan dela Cruz",
            "email": "juan@test.com"
        }
    }
}
```

**I-copy ang `accessToken`** — gagamitin sa lahat ng susunod na request.

---

## HAKBANG 9 — LOGIN

```
Method : POST
URL    : http://localhost:3000/api/auth/login
Body   : raw → JSON
```
```json
{
    "email": "juan@test.com",
    "password": "password123"
}
```

---

## HAKBANG 10 — I-SET ang TOKEN sa Postman (isang beses lang)

Para hindi manu-manong mag-paste ng token sa bawat request:

**Sa iyong Register o Login request:**
1. I-click ang **Tests** tab
2. I-paste ito:
```javascript
const res = pm.response.json();
if (res.success) {
    pm.collectionVariables.set("token", res.data.accessToken);
}
```
3. I-click ang **Send** ulit

**Sa lahat ng protected requests:**
1. I-click ang **Authorization** tab
2. Type: **Bearer Token**
3. Token: **{{token}}**

---

## HAKBANG 11 — GAMITIN ANG LAHAT NG ENDPOINTS

### GET — Lahat ng items
```
Method : GET
URL    : http://localhost:3000/api/items
Auth   : Bearer Token → {{token}}
```

### GET — Isang item
```
Method : GET
URL    : http://localhost:3000/api/items/1
Auth   : Bearer Token → {{token}}
```

### POST — Gumawa ng item
```
Method : POST
URL    : http://localhost:3000/api/items
Auth   : Bearer Token → {{token}}
Body   : raw → JSON
```
```json
{
    "name": "Bagong Item",
    "description": "Ito ay isang test item",
    "status": "active"
}
```

### PUT — I-update ang lahat ng fields
```
Method : PUT
URL    : http://localhost:3000/api/items/1
Auth   : Bearer Token → {{token}}
Body   : raw → JSON
```
```json
{
    "name": "Na-update na Item",
    "description": "Na-update na description",
    "status": "inactive"
}
```

### PATCH — I-update ang isang field lang
```
Method : PATCH
URL    : http://localhost:3000/api/items/1
Auth   : Bearer Token → {{token}}
Body   : raw → JSON
```
```json
{
    "status": "inactive"
}
```

### DELETE — Burahin ang item
```
Method : DELETE
URL    : http://localhost:3000/api/items/1
Auth   : Bearer Token → {{token}}
```

---

## HAKBANG 12 — GET PROFILE

```
Method : GET
URL    : http://localhost:3000/api/auth/me
Auth   : Bearer Token → {{token}}
```

---

## HAKBANG 13 — LOGOUT

```
Method : POST
URL    : http://localhost:3000/api/auth/logout
Auth   : Bearer Token → {{token}}
Body   : raw → JSON
```
```json
{
    "refreshToken": "a3f9bc2d..."
}
```

---

---

# BAHAGI 3 — MGA KARANIWANG ERROR AT SOLUSYON

---

### Error: Cannot find module 'express'
```
Solusyon: npm install
```

### Error: EADDRINUSE (port 3000 in use)
```bash
netstat -ano | findstr :3000
taskkill /PID <number na nakita> /F
node server.js
```

### Error: Cannot find module 'server.js'
```
Solusyon: Pumunta sa tamang folder muna
cd "C:\...\COMPLETE-API-BASIC"
```

### Response: 401 Unauthorized
```
Solusyon: Lagyan ng token ang Authorization header
Authorization: Bearer <accessToken>
```

### Response: 403 Forbidden
```
Solusyon: Expired na ang token — mag-login ulit para makakuha ng bago
```

### .env error — JWT_SECRET=JWT_SECRET=...
```
Solusyon: Buksan ang .env, burahin ang duplicate
MALI:   JWT_SECRET=JWT_SECRET=abc123
TAMA:   JWT_SECRET=abc123
```

---

---

# BAHAGI 4 — LAHAT NG ENDPOINTS

---

## AUTH
| Method | URL | Gamit | Token |
|--------|-----|-------|-------|
| POST | /api/auth/register | Mag-register | Hindi |
| POST | /api/auth/login | Mag-login | Hindi |
| POST | /api/auth/refresh | Kumuha ng bagong token | Hindi |
| GET | /api/auth/me | Tingnan ang sariling profile | Kailangan |
| POST | /api/auth/logout | Mag-logout | Kailangan |

## ITEMS
| Method | URL | Gamit | Token |
|--------|-----|-------|-------|
| GET | /api/items | Lahat ng items | Kailangan |
| GET | /api/items/:id | Isang item | Kailangan |
| POST | /api/items | Gumawa ng item | Kailangan |
| PUT | /api/items/:id | I-update lahat ng fields | Kailangan |
| PATCH | /api/items/:id | I-update isang field lang | Kailangan |
| DELETE | /api/items/:id | Burahin ang item | Kailangan |

---

---

# BAHAGI 5 — QUERY PARAMETERS

Para sa GET /api/items, pwedeng magdagdag ng filters:

| Parameter | Gamit | Example |
|-----------|-------|---------|
| search | Maghanap | ?search=laptop |
| status | Filter | ?status=active |
| page | Pahina | ?page=2 |
| limit | Bilang per page | ?limit=5 |

**Halimbawa:**
```
GET http://localhost:3000/api/items?search=item&status=active&page=1&limit=5
```

---

---

# BAHAGI 6 — SECURITY NG API

| Security | Saan | Ginagawa |
|----------|------|---------|
| JWT Verification | middleware/auth.js | Sinisigurado na valid ang token |
| AES-256-GCM Encryption | utils/tokenUtils.js | Naka-encrypt ang payload ng token |
| bcrypt Password | routes/auth.js | Hindi readable ang password sa DB |
| Rate Limiting | middleware/rateLimiter.js | Max 100 requests per 15 min |
| Auth Rate Limit | middleware/rateLimiter.js | Max 10 login attempts per 15 min |
| Helmet Headers | server.js | Anti-XSS, anti-clickjacking |
| CORS | server.js | Tanging frontend URL lang |

---

> I-open ang file na ito anytime na kailangan mo ng reference.
> File: COMPLETE-API-BASIC/FULL-SETUP.md
