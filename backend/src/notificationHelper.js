const crypto = require("crypto");
const { readJSON, writeJSON } = require("./db");

function addNotification(userId, message) {
  const notifications = readJSON("notifications");
  notifications.unshift({
    id: crypto.randomUUID(),
    userId,
    message,
    read: false,
    createdAt: new Date().toISOString()
  });
  writeJSON("notifications", notifications);
}

module.exports = { addNotification };
