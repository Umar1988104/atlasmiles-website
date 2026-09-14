const express = require("express");
const { readJSON } = require("./db");

const router = express.Router();

// GET /api/packages
router.get("/", (req, res) => {
  const packages = readJSON("packages");
  const summary = packages.map(p => ({
    id: p.id,
    name: p.name,
    destination: p.destination,
    price: p.price,
    duration: p.duration,
    shortDescription: p.shortDescription,
    image: p.images && p.images[0]
  }));
  res.json({ packages: summary });
});

// GET /api/packages/:id
router.get("/:id", (req, res) => {
  const packages = readJSON("packages");
  const pkg = packages.find(p => p.id === req.params.id);
  if (!pkg) return res.status(404).json({ error: "Package not found." });
  res.json({ package: pkg });
});

module.exports = router;
