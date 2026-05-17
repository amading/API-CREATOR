# SETTINGS API — User Preferences · Notifications · Appearance

## HAKBANG 1 — Kopyahin ang file
```
settings.js  →  i-paste sa  routes/settings.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/settings", require("./routes/settings"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/settings | Kunin ang lahat ng settings | Kailangan |
| PUT | /api/settings | I-update ang settings | Kailangan |
| PUT | /api/settings/notifications | I-update ang notif settings lang | Kailangan |
| DELETE | /api/settings | I-reset sa default | Kailangan |

---

## DEFAULT NA SETTINGS

```json
{
  "notifications": {
    "push": true,
    "email": true,
    "sms": false,
    "orderUpdates": true,
    "promotions": false
  },
  "privacy": {
    "showProfile": true,
    "showActivity": false
  },
  "appearance": {
    "theme": "light",
    "language": "filipino",
    "fontSize": "medium"
  }
}
```

---

## SUBUKAN SA POSTMAN

### Kunin ang settings
```
GET   http://localhost:3000/api/settings
Headers:
  Authorization: Bearer <accessToken>
```

### I-update ang theme at language
```
PUT   http://localhost:3000/api/settings
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "appearance": {
    "theme": "dark",
    "language": "english"
  }
}
```

### I-off ang promotional notifications
```
PUT   http://localhost:3000/api/settings/notifications
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "promotions": false,
  "push": true,
  "email": false
}
```

### I-reset sa default
```
DELETE  http://localhost:3000/api/settings
Headers:
  Authorization: Bearer <accessToken>
```
