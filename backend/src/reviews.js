const express = require("express");
const crypto = require("crypto");
const { readJSON, writeJSON } = require("./db");
const { requireAuth } = require("./middleware/authMiddleware");

const router = express.Router();

// GET /api/reviews/package/:packageId — approved reviews only, public
router.get("/package/:packageId", (req, res) => {
  const reviews = readJSON("reviews")
    .filter(r => r.packageId === req.params.packageId && r.status === "approved")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ reviews });
});

// POST /api/reviews — submit a review (only for a package you've actually completed a trip for)
router.post("/", requireAuth, (req, res) => {
  const { packageId, rating, comment } = req.body;
  if (!packageId || !rating || !comment) {
    return res.status(400).json({ error: "Package, rating, and comment are required." });
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "Rating must be a whole number from 1 to 5." });
  }

  const packages = readJSON("packages");
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return res.status(404).json({ error: "Package not found." });

  const bookings = readJSON("bookings");
  const hasCompletedTrip = bookings.some(
    b => b.userId === req.userId && b.packageId === packageId && b.status === "confirmed" && b.tripStatus === "completed"
  );
  if (!hasCompletedTrip) {
    return res.status(403).json({ error: "You can only review a package after your trip is marked completed." });
  }

  const users = readJSON("users");
  const user = users.find(u => u.id === req.userId);

  const reviews = readJSON("reviews");
  const alreadyReviewed = reviews.some(r => r.packageId === packageId && r.userId === req.userId);
  if (alreadyReviewed) {
    return res.status(409).json({ error: "You've already reviewed this package." });
  }

  const review = {
    id: crypto.randomUUID(),
    packageId,
    packageName: pkg.name,
    userId: req.userId,
    userName: user ? user.name : "Traveller",
    rating: ratingNum,
    comment,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  reviews.push(review);
  writeJSON("reviews", reviews);

  res.status(201).json({ message: "Review submitted and awaiting approval.", review });
});

module.exports = router;
