// ============================================================
// APPOINTMENTS / BOOKING API — Full CRUD
// 👉 BASE URL: /api/appointments
// 👉 GAMITIN PARA SA: Clinic, salon, clinic, restaurant reservation,
//    consultation booking, service scheduling
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/appointments", require("./templates/FULL-CRUD/appointments"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
let appointments = [
  {
    id: "1",
    userId: "user-1",
    clientName: "Juan Dela Cruz",
    clientEmail: "juan@example.com",
    clientPhone: "09123456789",
    // 👉 PALITAN NG IYONG SERVICE TYPES
    service: "Haircut",
    date: "2024-02-15",
    time: "10:00",
    duration: 60, // sa minuto
    status: "confirmed",
    notes: "",
    createdAt: new Date(),
  },
];

// -------------------------------------------------------
// Mga available time slots — 👉 PALITAN AYON SA IYONG SCHEDULE
// -------------------------------------------------------
const BUSINESS_HOURS = {
  start: "09:00",  // 👉 PALITAN: Oras ng pagbubukas
  end: "18:00",    // 👉 PALITAN: Oras ng pagsasara
  slotDuration: 60, // 👉 PALITAN: Duration ng bawat slot (minuto)
  // 👉 PALITAN: Mga araw na bukas (0=Linggo, 1=Lunes, ..., 6=Sabado)
  workDays: [1, 2, 3, 4, 5, 6],
};

// -------------------------------------------------------
// GET /api/appointments — Lahat ng appointments
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // Kung user, sarili lang makikita; kung admin, lahat
    // 👉 PALITAN: const appts = req.user.role === "admin" ? await Appointment.find() : await Appointment.find({ userId: req.user.id })
    let appts = req.user.role === "admin"
      ? appointments
      : appointments.filter((a) => a.userId === req.user.id);

    // Filter by date range
    const { from, to, status, date } = req.query;
    if (from) appts = appts.filter((a) => a.date >= from);
    if (to) appts = appts.filter((a) => a.date <= to);
    if (status) appts = appts.filter((a) => a.status === status);
    if (date) appts = appts.filter((a) => a.date === date);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;

    return paginatedResponse(res, "Nakuha ang mga appointment.", appts.slice(start, start + limit), {
      total: appts.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga appointment.");
  }
});

// -------------------------------------------------------
// GET /api/appointments/available-slots?date=2024-02-15
// — Makita ang available na oras para sa isang araw
// -------------------------------------------------------
router.get("/available-slots", (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return errorResponse(res, "Kailangan ang date (YYYY-MM-DD format).", 400);

    // I-check kung valid na date at working day
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    if (!BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
      return successResponse(res, "Hindi bukas sa araw na iyon.", { slots: [], reason: "Non-working day" });
    }

    // Gumawa ng lahat ng possible time slots
    const [startHour, startMin] = BUSINESS_HOURS.start.split(":").map(Number);
    const [endHour, endMin] = BUSINESS_HOURS.end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const slots = [];

    for (let m = startMinutes; m < endMinutes; m += BUSINESS_HOURS.slotDuration) {
      const h = Math.floor(m / 60).toString().padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      slots.push(`${h}:${min}`);
    }

    // I-remove ang mga tapos nang may appointment
    // 👉 PALITAN: const booked = await Appointment.find({ date, status: { $ne: "cancelled" } }).select("time")
    const booked = appointments
      .filter((a) => a.date === date && a.status !== "cancelled")
      .map((a) => a.time);

    const available = slots.map((time) => ({
      time,
      available: !booked.includes(time),
    }));

    return successResponse(res, `Mga available slots para sa ${date}.`, available);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng available slots.");
  }
});

// -------------------------------------------------------
// POST /api/appointments — Gumawa ng bagong appointment
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD AYON SA IYONG BOOKING FORM
    const { clientName, clientEmail, clientPhone, service, date, time, notes } = req.body;

    if (!clientName || !service || !date || !time) {
      return errorResponse(res, "Kailangan ang clientName, service, date, at time.", 400);
    }

    // I-check kung available pa ang slot
    // 👉 PALITAN: const existing = await Appointment.findOne({ date, time, status: { $ne: "cancelled" } })
    const conflict = appointments.find(
      (a) => a.date === date && a.time === time && a.status !== "cancelled"
    );
    if (conflict) {
      return errorResponse(res, "Occupied na ang oras na iyon. Pumili ng iba.", 409);
    }

    // 👉 PALITAN: const appt = await Appointment.create({...})
    const newAppt = {
      id: Date.now().toString(),
      userId: req.user.id,
      clientName,
      clientEmail: clientEmail || req.user.email,
      clientPhone: clientPhone || "",
      service,
      date,
      time,
      duration: BUSINESS_HOURS.slotDuration,
      status: "pending", // 👉 pending → confirmed → completed / cancelled
      notes: notes || "",
      createdAt: new Date(),
    };
    appointments.push(newAppt);

    // 👉 DITO PWEDE KANG MAG-SEND NG EMAIL CONFIRMATION:
    // await sendEmail({ to: clientEmail, subject: "Appointment Confirmed", html: "..." })

    return successResponse(res, "Nagawa ang appointment! Abangan ang confirmation.", newAppt, 201);
  } catch (err) {
    return errorResponse(res, "May error sa paggawa ng appointment.");
  }
});

// -------------------------------------------------------
// PATCH /api/appointments/:id/status — I-update ang status (Admin)
// -------------------------------------------------------
router.patch("/:id/status", verifyAdmin, (req, res) => {
  try {
    const { status, reason } = req.body;
    // 👉 PALITAN ANG MGA VALID STATUS AYON SA IYONG WORKFLOW
    const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no-show"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Gamitin: ${validStatuses.join(", ")}`, 400);
    }

    const appt = appointments.find((a) => a.id === req.params.id);
    if (!appt) return errorResponse(res, "Hindi mahanap ang appointment.", 404);

    appt.status = status;
    if (reason) appt.cancellationReason = reason;
    appt.updatedAt = new Date();

    return successResponse(res, `Na-update ang appointment status sa "${status}".`, appt);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng status.");
  }
});

// -------------------------------------------------------
// PUT /api/appointments/:id — I-reschedule (may-ari o admin)
// -------------------------------------------------------
router.put("/:id", verifyToken, (req, res) => {
  try {
    const index = appointments.findIndex((a) => a.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang appointment.", 404);

    const appt = appointments[index];
    if (appt.userId !== req.user.id && req.user.role !== "admin") {
      return errorResponse(res, "Wala kang pahintulot na baguhin ang appointment na ito.", 403);
    }

    if (appt.status === "completed" || appt.status === "cancelled") {
      return errorResponse(res, "Hindi na pwedeng baguhin ang appointment na ito.", 400);
    }

    const { date, time, notes } = req.body;

    // I-check kung may conflict sa bagong oras
    if (date || time) {
      const newDate = date || appt.date;
      const newTime = time || appt.time;
      const conflict = appointments.find(
        (a) => a.id !== req.params.id && a.date === newDate && a.time === newTime && a.status !== "cancelled"
      );
      if (conflict) return errorResponse(res, "Occupied na ang oras na iyon.", 409);
    }

    appointments[index] = {
      ...appt,
      ...(date && { date }),
      ...(time && { time }),
      ...(notes !== undefined && { notes }),
      status: "pending", // I-reset sa pending pagkatapos ng reschedule
      updatedAt: new Date(),
    };

    return successResponse(res, "Na-reschedule ang appointment.", appointments[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-reschedule ng appointment.");
  }
});

// -------------------------------------------------------
// DELETE /api/appointments/:id — Cancel/Bura (may-ari o admin)
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = appointments.findIndex((a) => a.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang appointment.", 404);

    if (appointments[index].userId !== req.user.id && req.user.role !== "admin") {
      return errorResponse(res, "Wala kang pahintulot.", 403);
    }

    appointments.splice(index, 1);
    return successResponse(res, "Nabura/na-cancel ang appointment.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng appointment.");
  }
});

module.exports = router;
