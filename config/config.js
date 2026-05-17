// ============================================================
// CONFIG.JS — DITO MO PALAGING BINABAGO ANG MGA SETTINGS
// I-edit ang mga value na may arrow (👉) bago gamitin
// ============================================================

module.exports = {

  // 👉 PALITAN NG IYONG PORT NUMBER
  PORT: process.env.PORT || 3000,

  // 👉 PALITAN NG IYONG DATABASE URL (MongoDB, PostgreSQL, etc.)
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/mydb",

  // 👉 PALITAN NG MATIBAY NA SECRET KEY PARA SA ACCESS TOKEN
  JWT_SECRET: process.env.JWT_SECRET || "palitan-mo-to-ng-matibay-na-secret-key",

  // 👉 HIWALAY NA SECRET PARA SA REFRESH TOKEN (kailangan iba sa JWT_SECRET)
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "palitan-mo-ito-ng-ibang-matibay-na-secret-key",

  // 👉 32-BYTE ENCRYPTION KEY PARA SA JWT PAYLOAD (dapat 64 hex characters)
  // Para gumawa: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  JWT_ENCRYPTION_KEY: process.env.JWT_ENCRYPTION_KEY || "0000000000000000000000000000000000000000000000000000000000000000",

  // Access token — 15 minuto lang, para limitado ang damage kapag na-steal
  JWT_EXPIRES_IN: "15m",

  // Refresh token — 7 araw, para pwedeng kumuha ng bagong access token
  JWT_REFRESH_EXPIRES_IN: "7d",

  // -------------------------------------------------------
  // RATE LIMITER SETTINGS — Anti-spam at Anti-DDoS
  // -------------------------------------------------------
  RATE_LIMIT: {
    // 👉 GAANO KATAGAL ANG WINDOW SA MILLISECONDS (15 minuto = 15 * 60 * 1000)
    WINDOW_MS: 15 * 60 * 1000,

    // 👉 PINAKAMARAMING REQUEST NA PWEDE SA LOOB NG WINDOW
    MAX_REQUESTS: 100,

    // 👉 MENSAHE KAPAG NA-RATE LIMIT NA
    MESSAGE: "Napakaraming request. Pakihintay ng ilang minuto.",
  },

  // -------------------------------------------------------
  // STRICT RATE LIMIT — Para sa Login/Register (mas mababa)
  // -------------------------------------------------------
  AUTH_RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    // 👉 LIMITAHAN ANG LOGIN ATTEMPTS (konti lang para anti-brute force)
    MAX_REQUESTS: 10,
    MESSAGE: "Napakaraming login attempts. Pakihintay ng 15 minuto.",
  },

  // -------------------------------------------------------
  // ANTI-DDOS SPEED LIMITER
  // -------------------------------------------------------
  SLOW_DOWN: {
    // 👉 PAGKATAPOS NG ILANG REQUESTS MAGSISIMULANG BUMAGAL
    DELAY_AFTER: 50,
    // 👉 GAANO KATAGAL MA-DELAY ANG BAWAT REQUEST (sa milliseconds)
    DELAY_MS: 500,
  },

  // -------------------------------------------------------
  // CORS — Sino ang pwedeng mag-access ng API mo
  // -------------------------------------------------------
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  // 👉 PALITAN NG IYONG FRONTEND URL PARA SA PRODUCTION
  // Halimbawa: "https://iyong-website.com"

  // -------------------------------------------------------
  // FILE UPLOAD SETTINGS
  // -------------------------------------------------------
  UPLOAD: {
    // 👉 FOLDER KUNG SAAN MASE-SAVE ANG MGA UPLOADED FILES
    DEST: "uploads/",
    // 👉 MAXIMUM FILE SIZE SA BYTES (5MB = 5 * 1024 * 1024)
    MAX_SIZE: 5 * 1024 * 1024,
    // 👉 MGA ALLOWED FILE TYPES
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  },

  // -------------------------------------------------------
  // API KEY — Para sa super-secret na routes (optional)
  // -------------------------------------------------------
  // 👉 PALITAN NG SARILI MONG API KEY
  API_KEY: process.env.API_KEY || "iyong-api-key-dito-palitan-mo",
};
