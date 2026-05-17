# PRODUCTS API — CRUD ng mga Produkto · May Search

## HAKBANG 1 — Kopyahin ang file
```
products.js  →  i-paste sa  routes/products.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/products", require("./routes/products"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/products | Lahat ng produkto | Wala (public) |
| GET | /api/products/:id | Isang produkto | Wala (public) |
| POST | /api/products | Gumawa ng produkto | Admin only |
| PUT | /api/products/:id | I-edit ang produkto | Admin only |
| DELETE | /api/products/:id | Burahin ang produkto | Admin only |

---

## SUBUKAN SA POSTMAN

### Lahat ng products (public — walang token)
```
GET   http://localhost:3000/api/products
```

### May search at paginate
```
GET   http://localhost:3000/api/products?search=laptop&page=1&limit=10
```

### Isang product
```
GET   http://localhost:3000/api/products/1
```

### Gumawa ng product (Admin only)
```
POST  http://localhost:3000/api/products
Headers:
  Authorization: Bearer <accessToken ng admin>
Body:
{
  "name": "Bagong Produkto",
  "price": 1500,
  "category": "electronics",
  "stock": 20
}
```

### I-edit ang product (Admin only)
```
PUT   http://localhost:3000/api/products/1
Headers:
  Authorization: Bearer <accessToken ng admin>
Body:
{
  "price": 1200,
  "stock": 15
}
```

### Burahin (Admin only)
```
DELETE  http://localhost:3000/api/products/1
Headers:
  Authorization: Bearer <accessToken ng admin>
```

---

> Para sa mga public routes (GET), hindi na kailangan ng token.
> Para sa POST, PUT, DELETE — admin account ang kailangan.
