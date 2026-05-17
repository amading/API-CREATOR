const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config/config");
const { generalLimiter, speedLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(speedLimiter);
app.use(generalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ success: true, message: "Payments API tumatakbo!", timestamp: new Date().toISOString() }));

// AUTH — kailangan para makakuha ng token
app.use("/api/auth", require("./routes/auth"));

// PAYMENTS
app.use("/api/payments/gcash",        require("./routes/gcash"));
app.use("/api/payments/stripe",       require("./routes/stripe"));
app.use("/api/payments/paypal",       require("./routes/paypal"));
app.use("/api/payments/transactions", require("./routes/transactions"));

app.use((req, res) => res.status(404).json({ success: false, message: `Hindi mahanap: ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => { console.error("[ERROR]", err); res.status(500).json({ success: false, message: err.message }); });

app.listen(config.PORT, () => {
  console.log(`\n  PAYMENTS API: http://localhost:${config.PORT}`);
  console.log(`  POST /api/payments/gcash/pay`);
  console.log(`  POST /api/payments/gcash/maya/pay`);
  console.log(`  POST /api/payments/stripe/checkout`);
  console.log(`  POST /api/payments/paypal/create\n`);
});

module.exports = app;
