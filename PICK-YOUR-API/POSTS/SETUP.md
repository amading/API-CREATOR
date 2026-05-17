# POSTS API — Blog · Articles · News · May Likes

## HAKBANG 1 — Kopyahin ang file
```
posts.js  →  i-paste sa  routes/posts.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/posts", require("./routes/posts"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/posts | Lahat ng posts | Wala (public) |
| GET | /api/posts/:id | Isang post | Wala (public) |
| POST | /api/posts | Gumawa ng post | Kailangan |
| PUT | /api/posts/:id | I-edit ang post | Kailangan (author o admin) |
| POST | /api/posts/:id/like | I-like ang post | Kailangan |
| DELETE | /api/posts/:id | Burahin ang post | Kailangan (author o admin) |

---

## SUBUKAN SA POSTMAN

### Lahat ng posts (public)
```
GET   http://localhost:3000/api/posts
```

### May search
```
GET   http://localhost:3000/api/posts?search=hello&page=1&limit=10
```

### Gumawa ng post
```
POST  http://localhost:3000/api/posts
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "title": "Aking Unang Post",
  "content": "Ito ang nilalaman ng post ko."
}
```

### I-edit ang post (author lang)
```
PUT   http://localhost:3000/api/posts/1
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "title": "Na-edit na ang Title",
  "content": "Na-edit na rin ang content."
}
```

### I-like ang post
```
POST  http://localhost:3000/api/posts/1/like
Headers:
  Authorization: Bearer <accessToken>
```

### Burahin ang post (author lang)
```
DELETE  http://localhost:3000/api/posts/1
Headers:
  Authorization: Bearer <accessToken>
```
