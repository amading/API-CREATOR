# USERS API — Tingnan · I-edit · I-delete ang Users

## HAKBANG 1 — Kopyahin ang file
```
users.js  →  i-paste sa  routes/users.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/users", require("./routes/users"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/users | Lahat ng users | Admin only |
| GET | /api/users/:id | Isang user | Kailangan |
| PUT | /api/users/:id | I-edit ang user | Kailangan (sarili o admin) |
| DELETE | /api/users/:id | Burahin ang user | Admin only |

---

## SUBUKAN SA POSTMAN

### Lahat ng users (Admin only)
```
GET   http://localhost:3000/api/users
Headers:
  Authorization: Bearer <accessToken ng admin>
```

### Isang user
```
GET   http://localhost:3000/api/users/1
Headers:
  Authorization: Bearer <accessToken>
```

### I-edit ang user
```
PUT   http://localhost:3000/api/users/1
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "name": "Bagong Pangalan",
  "email": "bago@email.com"
}
```

### Burahin ang user (Admin only)
```
DELETE  http://localhost:3000/api/users/1
Headers:
  Authorization: Bearer <accessToken ng admin>
```

---

> Kailangan muna ng AUTH API para makakuha ng token.
