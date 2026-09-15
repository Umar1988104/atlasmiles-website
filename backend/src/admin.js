const express = require("express");
const crypto = require("crypto");
const { readJSON, writeJSON } = require("./db");
const { requireAuth, requireAdmin } = require("./middleware/authMiddleware");
const { addNotification } = require("./notificationHelper");
const { maskTravellerDetails } = require("./bookings");

const router = express.Router();

router.use(requireAuth, requireAdmin);

// ===== Dashboard stats =====
router.get("/stats", (req, res) => {
  const users = readJSON("users");
  const bookings = readJSON("bookings");
  const reviews = readJSON("reviews");

  const revenue = bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  res.json({
    totalUsers: users.filter(u => u.role !== "admin").length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    pendingReviews: reviews.filter(r => r.status === "pending").length,
    totalRevenue: revenue
  });
});

// ===== Package management =====
router.get("/packages", (req, res) => {
  res.json({ packages: readJSON("packages") });
});

router.post("/packages", (req, res) => {
  const { name, destination, price, duration, shortDescription, seatsAvailable, dates, highlights, inclusions, exclusions, images, itinerary } = req.body;
  if (!name || !destination || !price || !duration) {
    return res.status(400).json({ error: "Name, destination, price, and duration are required." });
  }

  const packages = readJSON("packages");
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + crypto.randomBytes(3).toString("hex");

  const newPkg = {
    id,
    name,
    destination,
    price: Number(price),
    duration,
    dates: dates || [],
    seatsAvailable: Number(seatsAvailable) || 0,
    shortDescription: shortDescription || "",
    highlights: highlights || [],
    itinerary: itinerary || [],
    inclusions: inclusions || [],
    exclusions: exclusions || [],
    images: images && images.length ? images : ["https://picsum.photos/seed/" + id + "/800/500"]
  };

  packages.push(newPkg);
  writeJSON("packages", packages);
  res.status(201).json({ package: newPkg });
});

router.put("/packages/:id", (req, res) => {
  const packages = readJSON("packages");
  const idx = packages.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Package not found." });

  const allowedFields = ["name", "destination", "price", "duration", "shortDescription", "seatsAvailable", "dates", "highlights", "inclusions", "exclusions", "images", "itinerary"];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) packages[idx][field] = req.body[field];
  });
  if (req.body.price !== undefined) packages[idx].price = Number(req.body.price);
  if (req.body.seatsAvailable !== undefined) packages[idx].seatsAvailable = Number(req.body.seatsAvailable);

  writeJSON("packages", packages);
  res.json({ package: packages[idx] });
});

router.delete("/packages/:id", (req, res) => {
  const packages = readJSON("packages");
  const filtered = packages.filter(p => p.id !== req.params.id);
  if (filtered.length === packages.length) return res.status(404).json({ error: "Package not found." });
  writeJSON("packages", filtered);
  res.json({ message: "Package deleted." });
});

// ===== Booking management =====
router.get("/bookings", (req, res) => {
  const bookings = readJSON("bookings")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(b => ({ ...b, travellerDetails: maskTravellerDetails(b.travellerDetails) }));
  res.json({ bookings });
});

router.put("/bookings/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["pending_payment", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }
  const bookings = readJSON("bookings");
  const idx = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Booking not found." });

  bookings[idx].status = status;
  writeJSON("bookings", bookings);
  addNotification(bookings[idx].userId, `Your booking for ${bookings[idx].packageName} was updated to "${status.replace("_", " ")}" by our team.`);
  res.json({ booking: bookings[idx] });
});

router.put("/bookings/:id/trip-status", (req, res) => {
  const { tripStatus, announcement } = req.body;
  const validStatuses = ["upcoming", "departed", "in_progress", "completed"];
  if (!validStatuses.includes(tripStatus)) {
    return res.status(400).json({ error: "Invalid trip status." });
  }
  const bookings = readJSON("bookings");
  const idx = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Booking not found." });

  bookings[idx].tripStatus = tripStatus;
  if (announcement) {
    bookings[idx].tripUpdates = bookings[idx].tripUpdates || [];
    bookings[idx].tripUpdates.unshift({ message: announcement, postedAt: new Date().toISOString() });
  }
  writeJSON("bookings", bookings);
  addNotification(bookings[idx].userId, `Trip update for ${bookings[idx].packageName}: ${announcement || tripStatus.replace("_", " ")}`);
  res.json({ booking: bookings[idx] });
});

// ===== User management =====
router.get("/users", (req, res) => {
  const users = readJSON("users")
    .filter(u => u.role !== "admin")
    .map(({ passwordHash, ...rest }) => rest);
  res.json({ users });
});

router.put("/users/:id/toggle-disabled", (req, res) => {
  const users = readJSON("users");
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found." });
  users[idx].disabled = !users[idx].disabled;
  writeJSON("users", users);
  const { passwordHash, ...publicUser } = users[idx];
  res.json({ user: publicUser });
});

// ===== Review moderation =====
router.get("/reviews", (req, res) => {
  const reviews = readJSON("reviews").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ reviews });
});

router.put("/reviews/:id", (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
  }
  const reviews = readJSON("reviews");
  const idx = reviews.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Review not found." });

  reviews[idx].status = status;
  writeJSON("reviews", reviews);
  if (status === "approved") {
    addNotification(reviews[idx].userId, `Your review for ${reviews[idx].packageName} was approved and is now public.`);
  }
  res.json({ review: reviews[idx] });
});

// ===== Gallery management =====
router.get("/gallery", (req, res) => {
  res.json({ images: readJSON("gallery") });
});

router.post("/gallery", (req, res) => {
  const { album, url, caption } = req.body;
  if (!album || !url) return res.status(400).json({ error: "Album and image URL are required." });

  const gallery = readJSON("gallery");
  const image = { id: crypto.randomUUID(), album, url, caption: caption || "", published: true, createdAt: new Date().toISOString() };
  gallery.push(image);
  writeJSON("gallery", gallery);
  res.status(201).json({ image });
});

router.put("/gallery/:id/toggle-published", (req, res) => {
  const gallery = readJSON("gallery");
  const idx = gallery.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Image not found." });
  gallery[idx].published = !gallery[idx].published;
  writeJSON("gallery", gallery);
  res.json({ image: gallery[idx] });
});

router.delete("/gallery/:id", (req, res) => {
  const gallery = readJSON("gallery");
  const filtered = gallery.filter(g => g.id !== req.params.id);
  if (filtered.length === gallery.length) return res.status(404).json({ error: "Image not found." });
  writeJSON("gallery", filtered);
  res.json({ message: "Image deleted." });
});

module.exports = router;
