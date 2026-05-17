# FAVORITES / WISHLIST API — I-save ang mga Paboritong Items

## HAKBANG 1 — Kopyahin ang file
```
favorites.js  →  i-paste sa  routes/favorites.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/favorites", require("./routes/favorites"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/favorites | Lahat ng paborito | Kailangan |
| GET | /api/favorites?itemType=product | Filter by type | Kailangan |
| POST | /api/favorites | Idagdag sa paborito | Kailangan |
| GET | /api/favorites/check/:itemId | Tingnan kung paborito na | Kailangan |
| DELETE | /api/favorites/:itemId | Alisin sa paborito | Kailangan |

### Mga valid na itemType:
```
product, post, article, store
```

---

## SUBUKAN SA POSTMAN

### Lahat ng favorites
```
GET   http://localhost:3000/api/favorites
Headers:
  Authorization: Bearer <accessToken>
```

### Idagdag sa favorites
```
POST  http://localhost:3000/api/favorites
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "itemId": "1",
  "itemType": "product"
}
```

### Tingnan kung paborito na (para sa heart button sa app)
```
GET   http://localhost:3000/api/favorites/check/1
Headers:
  Authorization: Bearer <accessToken>

Response:
{
  "data": { "isFavorite": true }
}
```

### Alisin sa favorites
```
DELETE  http://localhost:3000/api/favorites/1
Headers:
  Authorization: Bearer <accessToken>
```
