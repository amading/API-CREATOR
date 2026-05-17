# COMPLETE-API-SOCIAL — Social Media API

## HAKBANG 1 — Install
```bash
npm install
```

## HAKBANG 2 — .env
```bash
copy .env.example .env
```
Generate keys:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

## HAKBANG 3 — Run
```bash
node server.js
```

---

## LAHAT NG ENDPOINTS

### AUTH
```
POST   /api/auth/register          Mag-register
POST   /api/auth/login             Mag-login → token
POST   /api/auth/refresh           I-refresh ang token
GET    /api/auth/me             🔒 Sariling profile
POST   /api/auth/logout         🔒 Mag-logout
```

### PROFILE & USERS
```
GET    /api/profile             🔒 Tingnan ang sariling profile
PUT    /api/profile             🔒 I-edit (name, bio)
PUT    /api/profile/password    🔒 Palitan ang password
POST   /api/profile/avatar      🔒 Mag-upload ng profile pic
```

### FOLLOW SYSTEM
```
POST   /api/follow/:userId      🔒 Sundan ang user
DELETE /api/follow/:userId      🔒 Hindi na sundan
GET    /api/follow/:userId/followers   Mga followers (public)
GET    /api/follow/:userId/following   Mga sinusundan (public)
GET    /api/follow/check/:userId 🔒 Tingnan kung sinusundan
```

### POSTS
```
GET    /api/posts                  Lahat ng posts (public)
GET    /api/posts/:id              Isang post (public)
POST   /api/posts               🔒 Mag-post
PUT    /api/posts/:id           🔒 I-edit (author o admin)
POST   /api/posts/:id/like      🔒 I-like ang post
DELETE /api/posts/:id           🔒 Burahin (author o admin)
```

### STORIES (24 hours)
```
GET    /api/stories/feed        🔒 Stories ng mga sinusundan
GET    /api/stories/me          🔒 Sariling mga stories
POST   /api/stories             🔒 Mag-post ng story (may media)
POST   /api/stories/:id/view    🔒 I-record na nanood
DELETE /api/stories/:id         🔒 Burahin ang story
```

### COMMENTS
```
GET    /api/comments?postId=1      Lahat ng comments (public)
POST   /api/comments            🔒 Mag-comment
PUT    /api/comments/:id        🔒 I-edit (author o admin)
POST   /api/comments/:id/like   🔒 I-like ang comment
DELETE /api/comments/:id        🔒 Burahin (author o admin)
```

### HASHTAGS
```
GET    /api/hashtags/trending      Trending hashtags (public)
GET    /api/hashtags/search?q=     Maghanap ng hashtag (public)
GET    /api/hashtags/:tag/posts    Posts ng hashtag (public)
```

### MESSAGES
```
GET    /api/messages/inbox      🔒 Lahat ng conversations
GET    /api/messages/:userId    🔒 Conversation kasama ang user
POST   /api/messages            🔒 Mag-send ng message
DELETE /api/messages/:id        🔒 Burahin ang message
```

### MOBILE
```
GET    /api/notifications                🔒 Mga notif + unread count
PATCH  /api/notifications/:id/read      🔒 Markahan bilang nabasa
PATCH  /api/notifications/read-all      🔒 Lahat nabasa
POST   /api/device-tokens               🔒 I-register ang device
GET    /api/settings                    🔒 App settings
PUT    /api/settings                    🔒 I-update settings
POST   /api/files/upload                🔒 Mag-upload ng media
```
