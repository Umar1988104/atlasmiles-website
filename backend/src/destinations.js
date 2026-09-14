const express = require("express");
const { readJSON } = require("./db");

const router = express.Router();

// GET /api/destinations — derived from packages, no separate data entry needed yet
router.get("/", (req, res) => {
  const packages = readJSON("packages");
  const map = {};

  packages.forEach(p => {
    if (!map[p.destination]) {
      map[p.destination] = {
        name: p.destination,
        image: p.images && p.images[0],
        packageCount: 0
      };
    }
    map[p.destination].packageCount += 1;
  });

  res.json({ destinations: Object.values(map) });
});

module.exports = router;
