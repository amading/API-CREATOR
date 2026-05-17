const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { decryptPayload } = require("../utils/tokenUtils");
const { errorResponse } = require("../utils/response");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return errorResponse(res, "Walang token. Kailangan mag-login.", 401);
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = decryptPayload(decoded.data);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return errorResponse(res, "Expired na ang token. I-refresh ang session.", 401);
    return errorResponse(res, "Hindi valid ang token.", 403);
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin")
      return errorResponse(res, "Admin lang ang may access dito.", 403);
    next();
  });
};

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== config.API_KEY)
    return errorResponse(res, "Hindi valid ang API Key.", 401);
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyApiKey };
