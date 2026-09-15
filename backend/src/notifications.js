const express = require("express");
const { readJSON, writeJSON } = require("./db");
const { requireAuth } = require("./middleware/authMiddleware");

const router = express.Router();

// GET /api/notifications — current user's notifications, most recent first
router.get("/", requireAuth, (req, res) => {
  const notifications = readJSON("notifications")
    .filter(n => n.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications });
});

// PUT /api/notifications/:id/read
router.put("/:id/read", requireAuth, (req, res) => {
  const notifications = readJSON("notifications");
  const idx = notifications.findIndex(n => n.id === req.params.id && n.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: "Notification not found." });
  notifications[idx].read = true;
  writeJSON("notifications", notifications);
  res.json({ notification: notifications[idx] });
});

// PUT /api/notifications/read-all
router.put("/read-all", requireAuth, (req, res) => {
  const notifications = readJSON("notifications");
  notifications.forEach(n => { if (n.userId === req.userId) n.read = true; });
  writeJSON("notifications", notifications);
  res.json({ message: "All notifications marked read." });
});

module.exports = router;
