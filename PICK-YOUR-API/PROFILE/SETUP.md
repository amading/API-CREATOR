# PROFILE API — View · Edit · Change Password · Upload Avatar

## HAKBANG 1 — Kopyahin ang file
```
profile.js  →  i-paste sa  routes/profile.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/profile", require("./routes/profile"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| GET | /api/profile | Tingnan ang sariling profile | Kailangan |
| PUT | /api/profile | I-update ang name, bio | Kailangan |
| PUT | /api/profile/password | Palitan ang password | Kailangan |
| POST | /api/profile/avatar | Mag-upload ng profile picture | Kailangan |

---

## SUBUKAN SA POSTMAN

### Tingnan ang profile
```
GET   http://localhost:3000/api/profile
Headers:
  Authorization: Bearer <accessToken>
```

### I-update ang profile
```
PUT   http://localhost:3000/api/profile
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "name": "Bagong Pangalan",
  "bio": "Hello, ako si Juan!"
}
```

### Palitan ang password
```
PUT   http://localhost:3000/api/profile/password
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "currentPassword": "lumangpassword",
  "newPassword": "bagongpassword123"
}
```

### Mag-upload ng avatar
```
POST  http://localhost:3000/api/profile/avatar
Headers:
  Authorization: Bearer <accessToken>
Body:  form-data
  Key:   avatar   (type: File)
  Value: [piliin ang larawan mo — JPEG, PNG, GIF, max 2MB]
```
