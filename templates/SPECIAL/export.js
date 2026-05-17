// ============================================================
// EXPORT API — GET Only, Pag-download ng data bilang CSV o JSON
// 👉 BASE URL: /api/export
// 👉 GAMITIN PARA SA: Admin reports, data export, CSV download
// ============================================================
// PAANO GAMITIN:
//   1. npm install json2csv
//   2. sa server.js:  app.use("/api/export", require("./templates/SPECIAL/export"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/auth");
const { errorResponse } = require("../../utils/response");

// 👉 I-uncomment pagkatapos ng "npm install json2csv"
// const { parse } = require("json2csv");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE QUERIES
// -------------------------------------------------------
const usersData = [
  { id: "1", name: "Juan Dela Cruz", email: "juan@example.com", role: "user", createdAt: "2024-01-01" },
  { id: "2", name: "Maria Santos", email: "maria@example.com", role: "admin", createdAt: "2024-01-02" },
];

const ordersData = [
  { id: "1", userId: "1", total: 5000, status: "delivered", createdAt: "2024-01-05" },
  { id: "2", userId: "2", total: 12000, status: "pending", createdAt: "2024-01-06" },
];

// -------------------------------------------------------
// Helper: I-convert ang data sa CSV format
// -------------------------------------------------------
const toCSV = (data, fields) => {
  if (!data || data.length === 0) return "";

  // 👉 I-uncomment kapag may json2csv na:
  // return parse(data, { fields });

  // Simple CSV generator (placeholder)
  const keys = fields || Object.keys(data[0]);
  const header = keys.join(",");
  const rows = data.map((row) =>
    keys.map((k) => `"${(row[k] || "").toString().replace(/"/g, '""')}"`).join(",")
  );
  return [header, ...rows].join("\n");
};

// -------------------------------------------------------
// GET /api/export/users — I-download ang lahat ng users (Admin)
// -------------------------------------------------------
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const format = req.query.format || "json"; // 👉 "json" o "csv"

    // 👉 PALITAN: const data = await User.find().select("-password").lean()
    const data = usersData;

    if (format === "csv") {
      // 👉 PALITAN ANG FIELDS AYON SA IYONG USER MODEL
      const csv = toCSV(data, ["id", "name", "email", "role", "createdAt"]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=users-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.setHeader("Content-Disposition", `attachment; filename=users-${Date.now()}.json`);
    return res.json({ success: true, total: data.length, data });
  } catch (err) {
    return errorResponse(res, "May error sa pag-export ng users.");
  }
});

// -------------------------------------------------------
// GET /api/export/orders — I-download ang lahat ng orders (Admin)
// -------------------------------------------------------
router.get("/orders", verifyAdmin, async (req, res) => {
  try {
    const format = req.query.format || "json";
    const status = req.query.status; // 👉 Optional filter by status

    // 👉 PALITAN: const data = await Order.find(status ? { status } : {}).lean()
    let data = ordersData;
    if (status) data = data.filter((o) => o.status === status);

    if (format === "csv") {
      // 👉 PALITAN ANG FIELDS AYON SA IYONG ORDER MODEL
      const csv = toCSV(data, ["id", "userId", "total", "status", "createdAt"]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=orders-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.setHeader("Content-Disposition", `attachment; filename=orders-${Date.now()}.json`);
    return res.json({ success: true, total: data.length, data });
  } catch (err) {
    return errorResponse(res, "May error sa pag-export ng orders.");
  }
});

// -------------------------------------------------------
// GET /api/export/custom — Custom export (Admin) — flexible na export
// Usage: /api/export/custom?collection=products&format=csv&fields=id,name,price
// -------------------------------------------------------
router.get("/custom", verifyAdmin, async (req, res) => {
  try {
    const { collection, format, fields: fieldsStr } = req.query;

    // 👉 PALITAN: Idagdag ang lahat ng collection na pwedeng i-export
    const allowedCollections = ["users", "orders", "products"]; // 👉 PALITAN
    if (!collection || !allowedCollections.includes(collection)) {
      return errorResponse(
        res,
        `Hindi valid ang collection. Gamitin ang: ${allowedCollections.join(", ")}`,
        400
      );
    }

    // 👉 PALITAN: Kunin ang data mula sa DB base sa collection
    // const Model = require(`../../models/${collection}`)
    // const data = await Model.find().lean()
    const data = collection === "orders" ? ordersData : usersData;

    const fields = fieldsStr ? fieldsStr.split(",") : null;

    if (format === "csv") {
      const csv = toCSV(data, fields);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${collection}-${Date.now()}.csv`);
      return res.send(csv);
    }

    const filtered = fields
      ? data.map((item) => Object.fromEntries(fields.map((f) => [f, item[f]])))
      : data;

    res.setHeader("Content-Disposition", `attachment; filename=${collection}-${Date.now()}.json`);
    return res.json({ success: true, collection, total: filtered.length, data: filtered });
  } catch (err) {
    return errorResponse(res, "May error sa custom export.");
  }
});

module.exports = router;
