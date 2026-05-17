# RATINGS API — I-rate ang Products o Services · Star Rating

## HAKBANG 1 — Kopyahin ang file
```
ratings.js  →  i-paste sa  routes/ratings.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/ratings", require("./routes/ratings"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/ratings?itemId=1&itemType=product | Lahat ng ratings + average | Wala (public) |
| POST | /api/ratings | Mag-rate ng item | Kailangan |
| PUT | /api/ratings/:id | I-edit ang sariling rating | Kailangan |
| DELETE | /api/ratings/:id | Burahin ang rating | Kailangan |

### Stars: 1 hanggang 5 lang

---

## SUBUKAN SA POSTMAN

### Lahat ng ratings ng isang product (kasama ang average)
```
GET   http://localhost:3000/api/ratings?itemId=1&itemType=product

Response:
{
  "data": {
    "ratings": [...],
    "total": 10,
    "average": 4.5
  }
}
```

### Mag-rate ng product
```
POST  http://localhost:3000/api/ratings
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "itemId": "1",
  "itemType": "product",
  "stars": 5,
  "review": "Sobrang ganda ng produkto!"
}
```

### I-edit ang rating
```
PUT   http://localhost:3000/api/ratings/1
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "stars": 4,
  "review": "Ok lang pala."
}
```

### Burahin ang rating
```
DELETE  http://localhost:3000/api/ratings/1
Headers:
  Authorization: Bearer <accessToken>
```
