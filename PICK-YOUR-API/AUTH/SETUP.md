# AUTH API — Register · Login · Logout · Refresh Token

## HAKBANG 1 — Kopyahin ang file
```
auth.js  →  i-paste sa  routes/auth.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/auth", require("./routes/auth"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| POST | /api/auth/register | Gumawa ng account | Hindi |
| POST | /api/auth/login | Mag-login | Hindi |
| POST | /api/auth/refresh | Kumuha ng bagong token | Hindi |
| GET | /api/auth/me | Tingnan ang profile | Kailangan |
| POST | /api/auth/logout | Mag-logout | Kailangan |

---

## SUBUKAN SA POSTMAN

### Register
```
POST  http://localhost:3000/api/auth/register
Body:
{
  "name": "Juan",
  "email": "juan@test.com",
  "password": "password123"
}
```

### Login
```
POST  http://localhost:3000/api/auth/login
Body:
{
  "email": "juan@test.com",
  "password": "password123"
}
```
Makikita ang `accessToken` at `refreshToken` sa response — i-save ang dalawa.

### Gamitin ang token
```
GET   http://localhost:3000/api/auth/me
Headers:
  Authorization: Bearer <i-paste ang accessToken dito>
```

### Logout
```
POST  http://localhost:3000/api/auth/logout
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "refreshToken": "<i-paste ang refreshToken>"
}
```
