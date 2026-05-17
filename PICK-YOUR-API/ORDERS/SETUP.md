# ORDERS API — E-commerce Orders · Status Tracking

## HAKBANG 1 — Kopyahin ang file
```
orders.js  →  i-paste sa  routes/orders.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/orders", require("./routes/orders"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/orders | Sariling orders (admin = lahat) | Kailangan |
| GET | /api/orders/:id | Isang order | Kailangan |
| POST | /api/orders | Gumawa ng order | Kailangan |
| PATCH | /api/orders/:id/status | I-update ang status | Admin only |
| DELETE | /api/orders/:id | Burahin ang order | Admin only |

### Mga valid na status:
```
pending  →  processing  →  shipped  →  delivered  →  cancelled
```

---

## SUBUKAN SA POSTMAN

### Lahat ng sariling orders
```
GET   http://localhost:3000/api/orders
Headers:
  Authorization: Bearer <accessToken>
```

### Gumawa ng order
```
POST  http://localhost:3000/api/orders
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "items": [
    { "productId": "1", "name": "Laptop", "qty": 1, "price": 45000 },
    { "productId": "2", "name": "Mouse",  "qty": 2, "price": 800  }
  ]
}
```

### I-update ang status (Admin only)
```
PATCH   http://localhost:3000/api/orders/1/status
Headers:
  Authorization: Bearer <accessToken ng admin>
Body:
{
  "status": "shipped"
}
```

### Burahin ang order (Admin only)
```
DELETE  http://localhost:3000/api/orders/1
Headers:
  Authorization: Bearer <accessToken ng admin>
```
