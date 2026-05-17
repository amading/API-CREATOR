module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/mydb",
  JWT_SECRET: process.env.JWT_SECRET || "palitan-mo",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "palitan-mo-rin",
  JWT_ENCRYPTION_KEY: process.env.JWT_ENCRYPTION_KEY || "0000000000000000000000000000000000000000000000000000000000000000",
  JWT_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
    MESSAGE: "Napakaraming request. Pakihintay ng ilang minuto.",
  },
  AUTH_RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 10,
    MESSAGE: "Napakaraming login attempts. Pakihintay ng 15 minuto.",
  },
  SLOW_DOWN: { DELAY_AFTER: 50, DELAY_MS: 500 },
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  UPLOAD: {
    DEST: "uploads/",
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  },
  API_KEY: process.env.API_KEY || "palitan-mo",
};
