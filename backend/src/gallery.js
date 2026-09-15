const express = require("express");
const { readJSON } = require("./db");

const router = express.Router();

// GET /api/gallery — published images only, grouped by album
router.get("/", (req, res) => {
  const images = readJSON("gallery").filter(g => g.published);
  const albums = {};
  images.forEach(img => {
    if (!albums[img.album]) albums[img.album] = [];
    albums[img.album].push(img);
  });
  res.json({ albums });
});

module.exports = router;
