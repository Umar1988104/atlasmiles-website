const express = require("express");
const crypto = require("crypto");
const { readJSON, writeJSON } = require("./db");
const { requireAuth } = require("./middleware/authMiddleware");

const router = express.Router();

// POST /api/bookings — create a booking (status starts as pending_payment)
router.post("/", requireAuth, (req, res) => {
  const { packageId, date, travellers, leadName, leadPhone } = req.body;

  if (!packageId || !date || !travellers || !leadName || !leadPhone) {
    return res.status(400).json({ error: "Package, date, traveller count, and lead traveller details are required." });
  }

  const packages = readJSON("packages");
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return res.status(404).json({ error: "Package not found." });

  if (!pkg.dates.includes(date)) {
    return res.status(400).json({ error: "Selected date is not available for this package." });
  }
  const travellerCount = Number(travellers);
  if (!Number.isInteger(travellerCount) || travellerCount < 1) {
    return res.status(400).json({ error: "Number of travellers must be at least 1." });
  }
  if (travellerCount > pkg.seatsAvailable) {
    return res.status(400).json({ error: `Only ${pkg.seatsAvailable} seats are available for this package.` });
  }

  const booking = {
    id: crypto.randomUUID(),
    userId: req.userId,
    packageId: pkg.id,
    packageName: pkg.name,
    destination: pkg.destination,
    date,
    travellers: travellerCount,
    leadName,
    leadPhone,
    pricePerPerson: pkg.price,
    totalAmount: pkg.price * travellerCount,
    status: "pending_payment",
    createdAt: new Date().toISOString()
  };

  const bookings = readJSON("bookings");
  bookings.push(booking);
  writeJSON("bookings", bookings);

  res.status(201).json({ booking });
});

// GET /api/bookings — list current user's bookings, most recent first
router.get("/", requireAuth, (req, res) => {
  const bookings = readJSON("bookings")
    .filter(b => b.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ bookings });
});

// GET /api/bookings/:id
router.get("/:id", requireAuth, (req, res) => {
  const bookings = readJSON("bookings");
  const booking = bookings.find(b => b.id === req.params.id && b.userId === req.userId);
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  res.json({ booking });
});

// POST /api/bookings/:id/pay — mock/sandbox payment (no real gateway wired up yet)
router.post("/:id/pay", requireAuth, (req, res) => {
  const bookings = readJSON("bookings");
  const idx = bookings.findIndex(b => b.id === req.params.id && b.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: "Booking not found." });

  if (bookings[idx].status === "confirmed") {
    return res.status(400).json({ error: "This booking has already been paid for." });
  }
  if (bookings[idx].status === "cancelled") {
    return res.status(400).json({ error: "This booking was cancelled and can't be paid for." });
  }

  // ⚠️ SANDBOX NOTE: this simulates a successful payment. A real gateway
  // (Razorpay/Stripe) will replace this endpoint's internals before public
  // launch — the booking record shape (transactionId, paidAt) is designed
  // to carry over unchanged when that happens.
  bookings[idx].status = "confirmed";
  bookings[idx].transactionId = `SANDBOX-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
  bookings[idx].paidAt = new Date().toISOString();
  writeJSON("bookings", bookings);

  res.json({ message: "Payment successful (sandbox mode).", booking: bookings[idx] });
});

// POST /api/bookings/:id/cancel
router.post("/:id/cancel", requireAuth, (req, res) => {
  const bookings = readJSON("bookings");
  const idx = bookings.findIndex(b => b.id === req.params.id && b.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: "Booking not found." });

  if (bookings[idx].status === "cancelled") {
    return res.status(400).json({ error: "This booking is already cancelled." });
  }

  bookings[idx].status = "cancelled";
  bookings[idx].cancelledAt = new Date().toISOString();
  writeJSON("bookings", bookings);

  res.json({ message: "Booking cancelled.", booking: bookings[idx] });
});

module.exports = router;
