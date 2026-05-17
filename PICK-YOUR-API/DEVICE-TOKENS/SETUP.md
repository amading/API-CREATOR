# DEVICE TOKENS API — Push Notifications para sa Mobile (FCM / APNs)

## HAKBANG 1 — Kopyahin ang file
```
device-tokens.js  →  i-paste sa  routes/device-tokens.js
```

## HAKBANG 2 — Idagdag sa `server.js`
```javascript
app.use("/api/device-tokens", require("./routes/device-tokens"));
```

## HAKBANG 3 — I-run
```bash
node server.js
```

---

## MGA ENDPOINTS

| Method | URL | Gamit | Token? |
|---|---|---|---|
| POST | /api/device-tokens | I-register ang device | Kailangan |
| GET | /api/device-tokens | Lahat ng devices ng user | Kailangan |
| DELETE | /api/device-tokens | Alisin ang device | Kailangan |

### Mga valid na platform:
```
android, ios, web
```

---

## PAANO GAMITIN SA MOBILE APP

```
1. Mag-login ang user
2. Kumuha ng FCM token (Firebase) o APNs token (Apple)
3. I-send ang token sa POST /api/device-tokens
4. Kapag nag-logout, i-call ang DELETE /api/device-tokens
```

---

## SUBUKAN SA POSTMAN

### I-register ang device (i-call after login)
```
POST  http://localhost:3000/api/device-tokens
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "token": "fcm-token-galing-sa-firebase-dito",
  "platform": "android",
  "deviceId": "unique-device-id-ng-phone"
}
```

### Lahat ng registered devices
```
GET   http://localhost:3000/api/device-tokens
Headers:
  Authorization: Bearer <accessToken>
```

### Alisin ang device (i-call bago mag-logout)
```
DELETE  http://localhost:3000/api/device-tokens
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "token": "fcm-token-galing-sa-firebase-dito"
}
```

---

> Para sa actual na pagpapadala ng push notifications, kailangan ng Firebase Admin SDK (Android) o APNs (iOS). Ang API na ito ay para lang sa pag-store ng device tokens.
