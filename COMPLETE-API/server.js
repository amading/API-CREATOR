const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const config = require("./config/config");
const { generalLimiter, speedLimiter } = require("./middleware/rateLimiter");

const app = express();

// ── SECURITY ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(speedLimiter);
app.use(generalLimiter);

// ── BODY PARSER ───────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── LOGGER ────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// ── STATIC FILES ──────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── HEALTH CHECK ──────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server tumatakbo!", timestamp: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════
// ROUTES — Tanggalin ang // sa mga API na gusto mo
// ══════════════════════════════════════════════════════════

// CORE — Kailangan palagi
app.use("/api/auth",          require("./routes/auth"));

// USERS & PROFILE
app.use("/api/users",         require("./routes/users"));
app.use("/api/profile",       require("./routes/profile"));

// CONTENT
app.use("/api/products",      require("./routes/products"));
app.use("/api/posts",         require("./routes/posts"));
app.use("/api/comments",      require("./routes/comments"));
app.use("/api/ratings",       require("./routes/ratings"));

// E-COMMERCE
app.use("/api/orders",        require("./routes/orders"));
app.use("/api/favorites",     require("./routes/favorites"));

// MOBILE
app.use("/api/messages",      require("./routes/messages"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/device-tokens", require("./routes/device-tokens"));
app.use("/api/settings",      require("./routes/settings"));
app.use("/api/files",         require("./routes/files"));

// ══════════════════════════════════════════════════════════

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Hindi mahanap: ${req.method} ${req.originalUrl}` });
});

// ── ERROR HANDLER ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "May error." });
});

// ── START ─────────────────────────────────────────────────
app.listen(config.PORT, () => {
  console.log("\n================================================");
  console.log(`  SERVER  : http://localhost:${config.PORT}`);
  console.log(`  HEALTH  : http://localhost:${config.PORT}/health`);
  console.log("================================================");
  console.log("  ROUTES:");
  console.log("  POST   /api/auth/register");
  console.log("  POST   /api/auth/login");
  console.log("  GET    /api/profile");
  console.log("  GET    /api/products");
  console.log("  GET    /api/posts");
  console.log("  GET    /api/orders");
  console.log("  GET    /api/messages/inbox");
  console.log("  GET    /api/notifications");
  console.log("  GET    /api/settings");
  console.log("================================================\n");
});

module.exports = app;
