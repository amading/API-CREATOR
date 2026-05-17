# FILES API — Mag-upload ng Images at Files

## HAKBANG 1 — Kopyahin ang file
```
files.js  →  i-paste sa  routes/files.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/files", require("./routes/files"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| POST | /api/files/upload | Mag-upload ng 1 file | Kailangan |
| POST | /api/files/upload-multiple | Mag-upload ng marami (max 5) | Kailangan |
| DELETE | /api/files/:filename | Burahin ang file | Kailangan |

### Allowed file types (mababago sa `config/config.js`):
```
image/jpeg, image/png, image/gif, application/pdf
```

### Maximum file size:
```
5MB (mababago sa config/config.js → UPLOAD.MAX_SIZE)
```

---

## SUBUKAN SA POSTMAN

### Mag-upload ng 1 file
```
POST  http://localhost:3000/api/files/upload
Headers:
  Authorization: Bearer <accessToken>
Body:  form-data
  Key:   file   (type: File)
  Value: [piliin ang file mo]
```

Response — makikita ang URL ng file:
```json
{
  "success": true,
  "data": {
    "filename": "1716000000-photo.jpg",
    "url": "http://localhost:3000/uploads/1716000000-photo.jpg"
  }
}
```

### Mag-upload ng maraming files (max 5)
```
POST  http://localhost:3000/api/files/upload-multiple
Headers:
  Authorization: Bearer <accessToken>
Body:  form-data
  Key:   files   (type: File)  ← pwedeng marami
  Value: [piliin ang mga files]
```

### Burahin ang file
```
DELETE  http://localhost:3000/api/files/1716000000-photo.jpg
Headers:
  Authorization: Bearer <accessToken>
```

---

> Ang mga uploaded files ay naka-save sa `uploads/` folder.
> Ma-access ang file gamit ang URL: `http://localhost:3000/uploads/filename.jpg`
