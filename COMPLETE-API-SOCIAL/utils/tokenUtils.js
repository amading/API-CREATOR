const crypto = require("crypto");
const config = require("../config/config");

function encryptPayload(data) {
  const key = Buffer.from(config.JWT_ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decryptPayload(encryptedStr) {
  const key = Buffer.from(config.JWT_ENCRYPTION_KEY, "hex");
  const buf = Buffer.from(encryptedStr, "base64url");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encryptPayload, decryptPayload };
