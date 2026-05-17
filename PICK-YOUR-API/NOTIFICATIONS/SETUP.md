# NOTIFICATIONS API — In-app Notifications · Read/Unread

## HAKBANG 1 — Kopyahin ang file
```
notifications.js  →  i-paste sa  routes/notifications.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/notifications", require("./routes/notifications"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/notifications | Lahat ng notif + unread count | Kailangan |
| PATCH | /api/notifications/:id/read | Markahan bilang nabasa | Kailangan |
| PATCH | /api/notifications/read-all | Markahan lahat nabasa | Kailangan |
| DELETE | /api/notifications/:id | Burahin ang notif | Kailangan |

---

## SUBUKAN SA POSTMAN

### Lahat ng notifications
```
GET   http://localhost:3000/api/notifications
Headers:
  Authorization: Bearer <accessToken>
```

Response:
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 2
  }
}
```

### Markahan bilang nabasa
```
PATCH   http://localhost:3000/api/notifications/1/read
Headers:
  Authorization: Bearer <accessToken>
```

### Markahan lahat bilang nabasa
```
PATCH   http://localhost:3000/api/notifications/read-all
Headers:
  Authorization: Bearer <accessToken>
```

### Burahin ang notif
```
DELETE  http://localhost:3000/api/notifications/1
Headers:
  Authorization: Bearer <accessToken>
```
