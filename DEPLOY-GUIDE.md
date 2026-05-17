# DEPLOY GUIDE — Paano I-publish ang API
### Para ma-access ng lahat sa internet

---

## BAGO MAG-DEPLOY — Checklist

```
[ ] Naka-install ang Node.js
[ ] Naka-install ang npm
[ ] May .env file na may tamang keys
[ ] Tumatakbo ang server locally (node server.js)
[ ] Naka-test na sa Postman (localhost)
```

---

---

# PARAAN 1 — CLOUDFLARE TUNNEL
### Pinakamadali · FREE · Pang-testing lang

> Ginagawa: I-expose ang local server mo sa internet nang hindi mag-de-deploy.
> Maganda para sa testing — ibabahagi mo lang ang URL sa iyong team.

---

## STEP 1 — I-download ang Cloudflared

Pumunta sa browser, i-download:
```
https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
```

I-save bilang `cloudflared.exe` sa iyong Desktop o sa project folder.

---

## STEP 2 — I-start ang iyong server

Buksan ang terminal sa project folder:
```bash
node server.js
```

Huwag isara ito. Mag-bukas ng bagong terminal para sa susunod.

---

## STEP 3 — I-run ang Cloudflare Tunnel

Sa bagong terminal, pumunta kung saan naka-save ang `cloudflared.exe`:
```bash
cloudflared.exe tunnel --url http://localhost:3000
```

Makikita mo ito pagkatapos ng ilang segundo:
```
+---------------------------------------------------------------+
|  https://abc-def-123.trycloudflare.com                        |
+---------------------------------------------------------------+
```

**Iyan ang iyong live URL!** Ibahagi sa kahit sino.

---

## STEP 4 — I-test sa Postman

Palitan ang `localhost:3000` ng Cloudflare URL:
```
POST  https://abc-def-123.trycloudflare.com/api/auth/register
POST  https://abc-def-123.trycloudflare.com/api/auth/login
GET   https://abc-def-123.trycloudflare.com/api/auth/me
GET   https://abc-def-123.trycloudflare.com/health
```

---

## CLOUDFLARE TUNNEL — Mga Importanteng Tandaan

```
✓ FREE — walang bayad
✓ HTTPS agad — secured na
✗ Bago ang URL tuwing i-restart mo ang tunnel
✗ Kapag sinara mo ang terminal — offline na ang server
✗ Para sa testing lang — hindi para sa production app
```

---

---

# PARAAN 2 — RAILWAY
### Pinakasimple mag-deploy · FREE tier · Permanent URL

> Ginagawa: I-upload ang code sa cloud para laging online kahit patayin mo ang computer.

---

## STEP 1 — Mag-sign up sa Railway

```
1. Pumunta sa: https://railway.app
2. I-click ang "Start a New Project"
3. Mag-sign up gamit ang GitHub account mo
```

---

## STEP 2 — Gumawa ng GitHub Repository

```
1. Pumunta sa: https://github.com
2. I-click ang "New" (green button)
3. Repository name: my-api (o kahit anong pangalan)
4. Private ✓
5. I-click ang "Create repository"
```

---

## STEP 3 — I-upload ang project sa GitHub

Buksan ang terminal sa loob ng project folder mo:
```bash
git init
git add .
git commit -m "Initial API upload"
git branch -M main
git remote add origin https://github.com/IYONG-USERNAME/my-api.git
git push -u origin main
```

---

## STEP 4 — I-connect sa Railway

```
1. Sa Railway dashboard → "New Project"
2. Piliin ang "Deploy from GitHub repo"
3. Piliin ang iyong repository (my-api)
4. I-click ang "Deploy Now"
```

---

## STEP 5 — I-lagay ang Environment Variables

Sa Railway dashboard:
```
1. I-click ang iyong project
2. Pumunta sa "Variables" tab
3. I-click ang "New Variable"
4. Ilagay ang mga ito isa-isa:
```

```
JWT_SECRET          = (i-run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_REFRESH_SECRET  = (i-run ulit ang command sa taas)
JWT_ENCRYPTION_KEY  = (i-run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PORT                = 3000
NODE_ENV            = production
CORS_ORIGIN         = *
```

---

## STEP 6 — Kunin ang URL

```
1. Sa Railway → iyong project → "Settings" tab
2. Hanapin ang "Domains"
3. I-click ang "Generate Domain"
4. Makuha mo ang URL:
   https://my-api-production.up.railway.app
```

---

## STEP 7 — I-test sa Postman

```
GET   https://my-api-production.up.railway.app/health
POST  https://my-api-production.up.railway.app/api/auth/register
POST  https://my-api-production.up.railway.app/api/auth/login
```

---

## RAILWAY — Mga Importanteng Tandaan

```
✓ FREE tier — $5 credit bawat buwan (sapat para sa testing)
✓ Permanent URL — laging online
✓ HTTPS agad — secured na
✓ Awtomatikong mag-re-redeploy kapag nag-push sa GitHub
✗ Kapag naubusan ng $5 credit — ma-pause ang server
```

---

---

# PARAAN 3 — RENDER
### FREE · May sleep mode pagkatapos ng 15 minuto ng walang activity

---

## STEP 1 — Mag-sign up sa Render

```
Pumunta sa: https://render.com
Mag-sign up gamit ang GitHub
```

---

## STEP 2 — I-upload sa GitHub (same as Railway STEP 2-3)

---

## STEP 3 — Gumawa ng bagong Web Service

```
1. Sa Render dashboard → "New +"
2. Piliin ang "Web Service"
3. I-connect ang GitHub repo mo
4. Punan ang settings:
   Name         : my-api
   Region       : Singapore (pinakamalapit sa PH)
   Branch       : main
   Build Command: npm install
   Start Command: node server.js
   Plan         : Free
```

---

## STEP 4 — I-lagay ang Environment Variables

```
Sa "Environment" tab ng Render:
JWT_SECRET         = (generate gamit ang command sa taas)
JWT_REFRESH_SECRET = (generate ulit)
JWT_ENCRYPTION_KEY = (generate gamit ang 32 bytes command)
NODE_ENV           = production
CORS_ORIGIN        = *
```

---

## STEP 5 — I-deploy at kunin ang URL

```
I-click ang "Create Web Service"
Hintayin ang deployment (3-5 minuto)
URL: https://my-api.onrender.com
```

---

## RENDER — Mga Importanteng Tandaan

```
✓ Totally FREE
✓ Permanent URL
✓ HTTPS agad
✗ Natutulog pagkatapos ng 15 minuto ng walang request
✗ Kapag may dumating na request pagkatapos ng sleep — 30-60 sec bago gumising
```

---

---

# POSTMAN SETUP — Para sa Live API

## I-save ang Environment sa Postman

```
1. Sa Postman → Environments → "Add"
2. Environment name: My API - Live
3. Magdagdag ng variables:

   base_url = https://iyong-url.railway.app
   token    = (magiging auto-fill ito)

4. I-save
```

## I-set ang Auto Token

Sa iyong Login request → Tests tab, ilagay ito:
```javascript
const res = pm.response.json();
if (res.success) {
  pm.environment.set("token", res.data.accessToken);
  pm.environment.set("refreshToken", res.data.refreshToken);
  console.log("Token saved!");
}
```

Sa lahat ng protected requests → Authorization tab:
```
Type  : Bearer Token
Token : {{token}}
```

## I-set ang Auto Refresh

Sa iyong collection → Pre-request Script tab, ilagay ito:
```javascript
const token = pm.environment.get("token");
if (!token) return;

// Check kung expired na (JWT ay may expiry)
try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  const isExpired = payload.exp < Date.now() / 1000;

  if (isExpired) {
    const refreshToken = pm.environment.get("refreshToken");
    pm.sendRequest({
      url: pm.environment.get("base_url") + "/api/auth/refresh",
      method: "POST",
      header: { "Content-Type": "application/json" },
      body: { mode: "raw", raw: JSON.stringify({ refreshToken }) }
    }, (err, res) => {
      if (!err && res.json().success) {
        pm.environment.set("token", res.json().data.accessToken);
        pm.environment.set("refreshToken", res.json().data.refreshToken);
      }
    });
  }
} catch (e) {}
```

---

---

# QUICK COMMANDS — Copy-paste Ready

## Generate Keys (i-run sa terminal)

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_ENCRYPTION_KEY (32 bytes lang)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# API_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Start Server

```bash
# Normal
node server.js

# Auto-restart kapag may changes (development)
npm run dev
```

## Cloudflare Tunnel (Quick Deploy)

```bash
cloudflared.exe tunnel --url http://localhost:3000
```

## Git Push (para mag-redeploy sa Railway/Render)

```bash
git add .
git commit -m "Update"
git push
```

---

---

# ALIN ANG PIPILIIN?

| | Cloudflare Tunnel | Railway | Render |
|---|---|---|---|
| **Bilis mag-setup** | 2 minuto | 15 minuto | 15 minuto |
| **Permanent URL** | HINDI | OO | OO |
| **Laging online** | HINDI | OO | HINDI (natutulog) |
| **Bayad** | FREE | FREE ($5/mo credit) | FREE |
| **Para saan** | Testing, Demo | Production | Production |
| **Pinakamadali** | ✓✓✓ | ✓✓ | ✓✓ |

---

## REKOMENDASYON

```
Gusto mo lang subukan / ipakita sa friend?
  → Cloudflare Tunnel (2 minuto, tapos na)

Gusto mo ng permanent live API?
  → Railway (pinakasimple, laging online)

Gusto mo ng totally free kahit may sleep?
  → Render (OK lang ang 30sec delay sa pag-gising)
```

---

> File na ito: DEPLOY-GUIDE.md
> I-open anytime para sa reference.
