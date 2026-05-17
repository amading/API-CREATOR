// ============================================================
// TOKEN UTILS — AES-256-GCM encryption para sa JWT payload
// Ginagamit ng middleware/auth.js at routes/auth.js
// ============================================================

const crypto = require("crypto");
const config = require("../config/config");

// I-encrypt ang payload object → base64url string
// AES-256-GCM: authenticated encryption (confidentiality + tamper detection)
function encryptPayload(data) {
  const key = Buffer.from(config.JWT_ENCRYPTION_KEY, "hex"); // 32 bytes
  const iv = crypto.randomBytes(12); // 96-bit IV para sa GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16 bytes — para madetect ang tampering

  // I-pack: iv (12) + authTag (16) + encrypted data
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

// I-decrypt ang base64url string → original payload object
function decryptPayload(encryptedStr) {
  const key = Buffer.from(config.JWT_ENCRYPTION_KEY, "hex");
  const buf = Buffer.from(encryptedStr, "base64url");

  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const data = buf.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag); // Kung na-tamper ang data, mag-eexplode dito

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encryptPayload, decryptPayload };
