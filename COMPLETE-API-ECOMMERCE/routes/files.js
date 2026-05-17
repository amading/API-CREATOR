// ============================================================
// FILES ROUTES — Upload at Download ng Files
// 👉 BASE URL: /api/files
// 👉 PALITAN ANG UPLOAD FOLDER AT ALLOWED TYPES SA config.js
// ============================================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config/config");
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// -------------------------------------------------------
// MULTER SETUP — Configuration ng file upload
// -------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Gumawa ng folder kung wala pa
    if (!fs.existsSync(config.UPLOAD.DEST)) {
      fs.mkdirSync(config.UPLOAD.DEST, { recursive: true });
    }
    cb(null, config.UPLOAD.DEST);
  },
  filename: (req, file, cb) => {
    // Format: timestamp-originalname (para unique ang filename)
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
    cb(null, uniqueName);
  },
});

// Filter kung anong file types ang tanggap
const fileFilter = (req, file, cb) => {
  if (config.UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Hindi allowed ang file type na "${file.mimetype}".`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.UPLOAD.MAX_SIZE },
});

// -------------------------------------------------------
// POST /api/files/upload — Mag-upload ng single file
// -------------------------------------------------------
router.post("/upload", verifyToken, upload.single("file"), (req, res) => {
  // 👉 FIELD NAME: "file" — palitan kung iba ang field name sa iyong frontend
  try {
    if (!req.file) {
      return errorResponse(res, "Walang na-upload na file.", 400);
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      // 👉 PALITAN NG IYONG ACTUAL URL (e.g., https://yoursite.com/uploads/...)
      url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    };

    // 👉 PWEDE KANG MAG-SAVE NG fileData SA DATABASE DITO

    return successResponse(res, "Matagumpay na na-upload ang file!", fileData, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pag-upload ng file.");
  }
});

// -------------------------------------------------------
// POST /api/files/upload-multiple — Mag-upload ng maraming files
// -------------------------------------------------------
router.post("/upload-multiple", verifyToken, upload.array("files", 5), (req, res) => {
  // 👉 "5" = maximum na bilang ng files, palitan kung gusto mo ng iba
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "Walang na-upload na files.", 400);
    }

    const filesData = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    }));

    return successResponse(res, `${filesData.length} files ang na-upload!`, filesData, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pag-upload ng files.");
  }
});

// -------------------------------------------------------
// DELETE /api/files/:filename — Burahin ang file
// -------------------------------------------------------
router.delete("/:filename", verifyToken, (req, res) => {
  try {
    const filePath = path.join(config.UPLOAD.DEST, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, "Hindi mahanap ang file.", 404);
    }

    // 👉 PWEDE KANG MAG-CHECK MUNA SA DB KUNG MAY PERMISSION ANG USER

    fs.unlinkSync(filePath);
    return successResponse(res, "Nabura ang file.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng file.");
  }
});

// Error handler para sa multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, `Sobrang laki ng file. Maximum ay ${config.UPLOAD.MAX_SIZE / 1024 / 1024}MB.`, 400);
    }
  }
  return errorResponse(res, err.message || "May error sa file upload.", 400);
});

module.exports = router;
