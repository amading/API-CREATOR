// ============================================================
// SERVER.JS — PANGUNAHING FILE NG API
// ============================================================
// 👉 PALITAN ANG MGA ROUTE NAMES KUNG GUSTO MO
// 👉 BAGUHIN ANG CONFIG SA config/config.js
// ============================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const config = require("./config/config");

// I-import ang mga middleware
const { generalLimiter, speedLimiter } = require("./middleware/rateLimiter");

// I-import ang mga routes
// 👉 IDAGDAG O ALISIN ANG MGA ROUTES AYON SA IYONG KAILANGAN
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const postRoutes = require("./routes/posts");
const orderRoutes = require("./routes/orders");
const fileRoutes = require("./routes/files");
const notificationRoutes = require("./routes/notifications");

const app = express();

// -------------------------------------------------------
// SECURITY MIDDLEWARE — Huwag baguhin ito
// -------------------------------------------------------
app.use(helmet()); // Nagtatakda ng secure HTTP headers
app.use(cors({ origin: config.CORS_ORIGIN })); // 👉 Palitan sa config.js

// -------------------------------------------------------
// ANTI-DDOS MIDDLEWARE — Inilalapat sa lahat ng routes
// -------------------------------------------------------
app.use(speedLimiter); // Pabagalin ang mabilis na requests
app.use(generalLimiter); // Limitahan ang bilang ng requests

// -------------------------------------------------------
// BODY PARSER — Para ma-read ang request body
// -------------------------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -------------------------------------------------------
// LOGGER — Para makita ang lahat ng requests sa console
// -------------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // 👉 Sa production, palitan ng "combined"
}

// -------------------------------------------------------
// STATIC FILES — Para ma-access ang uploaded files
// -------------------------------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------------------------------------
// HEALTH CHECK — Para masigurong tumatakbo ang server
// -------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server ay tumatakbo!",
    // 👉 PALITAN NG PANGALAN NG IYONG PROJECT
    project: "My API Project",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------
// ROUTES — I-register ang lahat ng API routes
// 👉 BAGUHIN ANG BASE PATHS KUNG GUSTO MO
// -------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/notifications", notificationRoutes);

// -------------------------------------------------------
// 404 HANDLER — Kapag ang route ay hindi makita
// -------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Hindi mahanap ang route: ${req.method} ${req.originalUrl}`,
  });
});

// -------------------------------------------------------
// GLOBAL ERROR HANDLER — Humahabol ng lahat ng errors
// -------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "May hindi inaasahang error.",
    // Sa production, huwag ipakita ang stack trace
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------
app.listen(config.PORT, () => {
  console.log("================================================");
  console.log(`  SERVER TUMATAKBO SA PORT ${config.PORT}`);
  console.log(`  Health Check: http://localhost:${config.PORT}/health`);
  console.log("================================================");
  console.log("  MGA AVAILABLE ROUTES:");
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/auth/me`);
  console.log(`  GET    /api/users`);
  console.log(`  GET    /api/products`);
  console.log(`  GET    /api/posts`);
  console.log(`  GET    /api/orders`);
  console.log(`  POST   /api/files/upload`);
  console.log(`  GET    /api/notifications`);
  console.log("================================================");
});

module.exports = app;
