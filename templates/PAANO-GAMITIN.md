# PAANO GAMITIN ANG MGA TEMPLATE

## HAKBANG 1 — Kopyahin ang template file sa iyong project
Halimbawa, gusto mong gumamit ng Comments API:
```
kopyahin ang:  templates/GET-POST/comments.js
i-paste sa:    routes/comments.js  (ng iyong bagong project)
```

## HAKBANG 2 — I-register sa server.js
```js
const commentsRoutes = require("./routes/comments");
app.use("/api/comments", commentsRoutes);
```

## HAKBANG 3 — Hanapin ang lahat ng 👉 at palitan
- Lahat ng may `👉` na symbol ay kailangan mong i-edit
- Lahat ng `// 👉 PALITAN:` ay may instructions kung paano palitan

---

## LISTAHAN NG LAHAT NG TEMPLATES

### GET-only/ — Para sa read-only na data
| File | Base URL | Gamit |
|------|----------|-------|
| `public-data.js` | /api/public | FAQs, announcements, app info |
| `search.js` | /api/search | Search bar, autocomplete, filters |
| `analytics.js` | /api/analytics | Dashboard stats, charts, reports |

### POST-only/ — Para sa form submissions
| File | Base URL | Gamit |
|------|----------|-------|
| `contact-form.js` | /api/contact | Contact us, feedback, report form |
| `newsletter.js` | /api/newsletter | Email subscription |
| `webhook.js` | /api/webhooks | Stripe, GitHub, custom webhooks |

### GET-POST/ — Para sa data na binabasa at sinusulat
| File | Base URL | Gamit |
|------|----------|-------|
| `comments.js` | /api/comments | Comment section, replies |
| `reviews.js` | /api/reviews | Product/service ratings |
| `messages.js` | /api/messages | Inbox, direct messages |

### FULL-CRUD/ — Complete na CRUD operations
| File | Base URL | Gamit |
|------|----------|-------|
| `categories.js` | /api/categories | Nested categories |
| `inventory.js` | /api/inventory | Stock management |
| `appointments.js` | /api/appointments | Booking/reservation system |

### PAYMENTS/ — Payment gateway integrations
| File | Base URL | Gamit | Bayad? |
|------|----------|-------|--------|
| `stripe.js` | /api/payments/stripe | International credit cards | May fee |
| `gcash-paymaya.js` | /api/payments/ph | GCash, Maya (PayMongo) | May fee |
| `paypal.js` | /api/payments/paypal | PayPal | May fee |

### SPECIAL/ — Espesyal na features
| File | Base URL | Gamit |
|------|----------|-------|
| `otp-verification.js` | /api/otp | SMS OTP (Semaphore para sa PH) |
| `email-sender.js` | /api/email | Transactional emails |
| `social-auth.js` | /api/auth/social | Google at Facebook login |
| `export.js` | /api/export | CSV/JSON data export |

---

## MGA KAILANGAN PALAGI (base project)
```
routes/           ← mula sa /routes ng base project
middleware/       ← rateLimiter.js at auth.js
utils/            ← response.js
config/           ← config.js
```

## KUNG ANONG I-INSTALL BAGO GAMITIN

| Template | npm install |
|----------|-------------|
| Lahat ng base | `npm install express express-rate-limit express-slow-down helmet cors morgan bcryptjs jsonwebtoken multer` |
| Stripe | `npm install stripe` |
| GCash/Maya | `npm install axios` |
| PayPal | `npm install axios` |
| OTP (Semaphore PH) | `npm install axios` |
| OTP (Twilio) | `npm install twilio` |
| Email (Gmail) | `npm install nodemailer` |
| Email (SendGrid) | `npm install @sendgrid/mail` |
| Email (Resend) | `npm install resend` |
| Google Login | `npm install google-auth-library` |
| Export CSV | `npm install json2csv` |
