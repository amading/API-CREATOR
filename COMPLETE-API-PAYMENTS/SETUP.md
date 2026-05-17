# COMPLETE-API-PAYMENTS — GCash · Maya · Stripe · PayPal
### Complete GET · POST · PATCH · DELETE

## HAKBANG 1 — Install
```bash
npm install
```

## HAKBANG 2 — .env
```bash
copy .env.example .env
```
Generate JWT keys:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```
Lagay din ang payment credentials sa .env (PayMongo, Stripe, PayPal keys)

## HAKBANG 3 — Run
```bash
node server.js
```

---

## LAHAT NG ENDPOINTS

### AUTH — Para makakuha ng token
```
POST   /api/auth/register          Mag-register
POST   /api/auth/login             Mag-login → makuha ang token
POST   /api/auth/refresh           I-refresh ang token
GET    /api/auth/me             🔒 Sariling profile
POST   /api/auth/logout         🔒 Mag-logout
```

---

### GCASH / MAYA (via PayMongo)
```
POST   /api/payments/gcash/pay              🔒 Gumawa ng GCash payment link
POST   /api/payments/gcash/maya/pay         🔒 Gumawa ng Maya payment
GET    /api/payments/gcash/history          🔒 History ng GCash/Maya payments
GET    /api/payments/gcash/status/:ref      🔒 Tingnan ang status ng payment
PATCH  /api/payments/gcash/:id/cancel       🔒 I-cancel ang pending payment
POST   /api/payments/gcash/webhook              PayMongo webhook (walang auth)
```

---

### STRIPE (Credit/Debit Card)
```
POST   /api/payments/stripe/checkout           🔒 Gumawa ng one-time checkout
GET    /api/payments/stripe/history            🔒 History ng Stripe payments
GET    /api/payments/stripe/status/:sessionId  🔒 Tingnan ang status
POST   /api/payments/stripe/refund             🔒 Mag-refund ng payment
POST   /api/payments/stripe/subscriptions      🔒 Gumawa ng recurring subscription
GET    /api/payments/stripe/subscriptions      🔒 Lahat ng subscriptions
DELETE /api/payments/stripe/subscriptions/:id  🔒 I-cancel ang subscription
POST   /api/payments/stripe/webhook                Stripe webhook (walang auth)
```

---

### PAYPAL
```
POST   /api/payments/paypal/create         🔒 Gumawa ng PayPal order
POST   /api/payments/paypal/capture/:id    🔒 Kunin ang bayad (after redirect)
GET    /api/payments/paypal/history        🔒 History ng PayPal payments
GET    /api/payments/paypal/status/:id     🔒 Tingnan ang status
POST   /api/payments/paypal/refund/:id     🔒 Mag-refund ng PayPal payment
```

---

### TRANSACTIONS — Lahat ng payment history
```
GET    /api/payments/transactions              🔒 Sariling transaction history
GET    /api/payments/transactions/:id          🔒 Isang transaction
GET    /api/payments/transactions/summary/me   🔒 Payment summary (total, by method)
PATCH  /api/payments/transactions/:id/status   🔒 I-update ang status (Admin only)
DELETE /api/payments/transactions/:id          🔒 Burahin ang transaction (Admin only)
GET    /api/payments/transactions/admin/all    🔒 Lahat ng transactions (Admin only)
GET    /api/payments/transactions/admin/revenue 🔒 Revenue report (Admin only)
```

---

## PAYMENT FLOWS

### GCash Flow
```
1. POST /api/payments/gcash/pay  →  makuha ang checkoutUrl
2. I-redirect ang user sa checkoutUrl
3. User magbabayad sa GCash app
4. PayMongo mag-ca-call ng webhook → /api/payments/gcash/webhook
5. GET /api/payments/gcash/status/:ref  →  i-verify na "paid"
```

### Stripe One-time Flow
```
1. POST /api/payments/stripe/checkout  →  makuha ang checkoutUrl
2. I-redirect ang user sa checkoutUrl
3. User magbabayad gamit ang card
4. Stripe mag-ca-call ng webhook → /api/payments/stripe/webhook
5. Stripe mag-re-redirect sa successUrl
```

### Stripe Subscription Flow
```
1. POST /api/payments/stripe/subscriptions  →  makuha ang checkoutUrl
2. I-redirect ang user sa checkoutUrl
3. User maglalagay ng card → automatic na mag-re-renew
4. DELETE /api/payments/stripe/subscriptions/:id  →  i-cancel
```

### PayPal Flow
```
1. POST /api/payments/paypal/create   →  makuha ang checkoutUrl + orderId
2. I-redirect ang user sa checkoutUrl
3. User mag-a-approve sa PayPal
4. PayPal mag-re-redirect sa return_url
5. POST /api/payments/paypal/capture/:orderId  →  kunin ang bayad
```

---

## QUERY FILTERS (para sa GET endpoints)

```
?status=paid         → paid, pending, failed, refunded, cancelled
?method=gcash        → gcash, maya, stripe, paypal
?page=1&limit=10     → pagination
?from=2025-01-01     → date filter (admin revenue)
?to=2025-12-31       → date filter (admin revenue)
```

---

## LEGEND
```
🔒 = Kailangan ng token
     Authorization: Bearer <accessToken>

Walang 🔒 = Webhook lang (tinatawagan ng payment provider)
```
