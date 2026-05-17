const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const config = require("./config/config");
const { generalLimiter, speedLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(speedLimiter);
app.use(generalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ success: true, message: "E-Commerce API tumatakbo!", timestamp: new Date().toISOString() }));

// AUTH
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/profile",       require("./routes/profile"));
app.use("/api/users",         require("./routes/users"));

// SHOP
app.use("/api/categories",    require("./routes/categories"));
app.use("/api/products",      require("./routes/products"));
app.use("/api/cart",          require("./routes/cart"));
app.use("/api/orders",        require("./routes/orders"));
app.use("/api/favorites",     require("./routes/favorites"));
app.use("/api/ratings",       require("./routes/ratings"));

// MOBILE SUPPORT
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/device-tokens", require("./routes/device-tokens"));
app.use("/api/settings",      require("./routes/settings"));
app.use("/api/files",         require("./routes/files"));

app.use((req, res) => res.status(404).json({ success: false, message: `Hindi mahanap: ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => { console.error("[ERROR]", err); res.status(500).json({ success: false, message: err.message }); });

app.listen(config.PORT, () => {
  console.log(`\n  E-COMMERCE API: http://localhost:${config.PORT}`);
  console.log(`  GET  /api/products     — Browse products`);
  console.log(`  GET  /api/categories   — Browse categories`);
  console.log(`  POST /api/cart         — Add to cart`);
  console.log(`  POST /api/orders       — Place order\n`);
});

module.exports = app;
