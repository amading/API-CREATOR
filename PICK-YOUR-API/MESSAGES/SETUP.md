# MESSAGES API — Direct Messages · Chat sa pagitan ng Users

## HAKBANG 1 — Kopyahin ang file
```
messages.js  →  i-paste sa  routes/messages.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/messages", require("./routes/messages"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/messages/inbox | Lahat ng conversations + unread count | Kailangan |
| GET | /api/messages/:userId | Conversation kasama ang isang user | Kailangan |
| POST | /api/messages | Mag-send ng message | Kailangan |
| DELETE | /api/messages/:id | Burahin ang message | Kailangan |

---

## SUBUKAN SA POSTMAN

### Inbox — lahat ng conversations
```
GET   http://localhost:3000/api/messages/inbox
Headers:
  Authorization: Bearer <accessToken>

Response:
{
  "data": {
    "conversations": [...],
    "unreadCount": 3
  }
}
```

### Conversation kasama ang user ID 2
```
GET   http://localhost:3000/api/messages/2
Headers:
  Authorization: Bearer <accessToken>
```

### Mag-send ng message sa user ID 2
```
POST  http://localhost:3000/api/messages
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "receiverId": "2",
  "text": "Kumusta ka na?"
}
```

### Burahin ang message
```
DELETE  http://localhost:3000/api/messages/1
Headers:
  Authorization: Bearer <accessToken>
```
