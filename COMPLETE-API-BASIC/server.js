const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const config  = require("./config/config");
const { generalLimiter, speedLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(speedLimiter);
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "API tumatakbo!", timestamp: new Date().toISOString() });
});

// ── ROUTES ────────────────────────────────────────────────
app.use("/api/auth",  require("./routes/auth"));   // kailangan palagi
app.use("/api/items", require("./routes/items"));  // palitan ng gusto mong pangalan
// ─────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Hindi mahanap: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ success: false, message: err.message || "May error." });
});

app.listen(config.PORT, () => {
  console.log(`\n  SERVER: http://localhost:${config.PORT}`);
  console.log(`  HEALTH: http://localhost:${config.PORT}/health\n`);
  console.log("  ENDPOINTS:");
  console.log("  GET    /api/items          — Lahat ng items");
  console.log("  GET    /api/items/:id      — Isang item");
  console.log("  POST   /api/items          — Gumawa ng item");
  console.log("  PUT    /api/items/:id      — I-update lahat ng fields");
  console.log("  PATCH  /api/items/:id      — I-update ilang fields lang");
  console.log("  DELETE /api/items/:id      — Burahin ang item\n");
});

module.exports = app;
