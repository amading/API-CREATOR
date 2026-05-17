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

app.get("/health", (req, res) => res.json({ success: true, message: "Social API tumatakbo!", timestamp: new Date().toISOString() }));

// AUTH & USERS
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/profile",       require("./routes/profile"));
app.use("/api/users",         require("./routes/users"));
app.use("/api/follow",        require("./routes/follow"));

// CONTENT
app.use("/api/posts",         require("./routes/posts"));
app.use("/api/stories",       require("./routes/stories"));
app.use("/api/comments",      require("./routes/comments"));
app.use("/api/hashtags",      require("./routes/hashtags"));

// MESSAGING
app.use("/api/messages",      require("./routes/messages"));
app.use("/api/notifications", require("./routes/notifications"));

// MOBILE
app.use("/api/device-tokens", require("./routes/device-tokens"));
app.use("/api/settings",      require("./routes/settings"));
app.use("/api/files",         require("./routes/files"));

app.use((req, res) => res.status(404).json({ success: false, message: `Hindi mahanap: ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => { console.error("[ERROR]", err); res.status(500).json({ success: false, message: err.message }); });

app.listen(config.PORT, () => {
  console.log(`\n  SOCIAL API: http://localhost:${config.PORT}`);
  console.log(`  POST /api/posts        — Create post`);
  console.log(`  POST /api/stories      — Post story`);
  console.log(`  POST /api/follow/:id   — Follow user`);
  console.log(`  GET  /api/messages/inbox — Messages\n`);
});

module.exports = app;
