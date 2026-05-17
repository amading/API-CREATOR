# COMMENTS API — Mag-comment sa Posts o Products · May Likes

## HAKBANG 1 — Kopyahin ang file
```
comments.js  →  i-paste sa  routes/comments.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/comments", require("./routes/comments"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/comments?postId=1 | Lahat ng comments ng post | Wala (public) |
| GET | /api/comments?productId=1 | Lahat ng comments ng product | Wala (public) |
| POST | /api/comments | Mag-post ng comment | Kailangan |
| PUT | /api/comments/:id | I-edit ang comment | Kailangan (author o admin) |
| POST | /api/comments/:id/like | I-like ang comment | Kailangan |
| DELETE | /api/comments/:id | Burahin ang comment | Kailangan (author o admin) |

---

## SUBUKAN SA POSTMAN

### Lahat ng comments ng isang post
```
GET   http://localhost:3000/api/comments?postId=1
```

### Mag-comment sa post
```
POST  http://localhost:3000/api/comments
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "postId": "1",
  "text": "Magandang post!"
}
```

### Mag-comment sa product
```
POST  http://localhost:3000/api/comments
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "productId": "1",
  "text": "Magandang produkto!"
}
```

### I-like ang comment
```
POST  http://localhost:3000/api/comments/1/like
Headers:
  Authorization: Bearer <accessToken>
```

### Burahin ang comment
```
DELETE  http://localhost:3000/api/comments/1
Headers:
  Authorization: Bearer <accessToken>
```
