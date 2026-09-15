const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { readJSON, writeJSON } = require("./db");
const { requireAuth } = require("./middleware/authMiddleware");
const { addNotification } = require("./notificationHelper");

const router = express.Router();

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const users = readJSON("users");
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    phone: phone || "",
    passwordHash,
    role: "customer",
    disabled: false,
    emailNotifications: true,
    emergencyContactName: "",
    emergencyContactPhone: "",
    savedPackages: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON("users", users);
  addNotification(newUser.id, "Welcome to Atlasmiles! Start by browsing our packages.");

  // Log the user in immediately after registering — no reason to make them
  // fill out the login form again right after they just filled out this one.
  const token = generateToken(newUser);
  return res.status(201).json({
    message: "Account created successfully.",
    token,
    user: publicUser(newUser)
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password, loginAs } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const users = readJSON("users");
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (user.disabled) {
    return res.status(403).json({ error: "This account has been disabled. Please contact support." });
  }

  // loginAs lets the login screen offer a "Traveller" / "Admin" choice.
  // We check it against the account's actual role so one login form can't
  // be used to casually try admin access on a normal account.
  if (loginAs === "admin" && user.role !== "admin") {
    return res.status(403).json({ error: "This account isn't registered as an admin. Try 'Traveller' instead." });
  }
  if (loginAs === "user" && user.role === "admin") {
    return res.status(403).json({ error: "This is an admin account. Try 'Admin' instead." });
  }

  const token = generateToken(user);
  return res.json({ token, user: publicUser(user) });
});

// GET /api/auth/profile
router.get("/profile", requireAuth, (req, res) => {
  const users = readJSON("users");
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user: publicUser(user) });
});

// PUT /api/auth/profile  (update name/phone/preferences)
router.put("/profile", requireAuth, (req, res) => {
  const { name, phone, emailNotifications, emergencyContactName, emergencyContactPhone } = req.body;
  const users = readJSON("users");
  const idx = users.findIndex(u => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: "User not found." });

  if (name) users[idx].name = name;
  if (phone !== undefined) users[idx].phone = phone;
  if (emailNotifications !== undefined) users[idx].emailNotifications = !!emailNotifications;
  if (emergencyContactName !== undefined) users[idx].emergencyContactName = emergencyContactName;
  if (emergencyContactPhone !== undefined) users[idx].emergencyContactPhone = emergencyContactPhone;
  writeJSON("users", users);

  return res.json({ message: "Profile updated.", user: publicUser(users[idx]) });
});

// PUT /api/auth/profile/password (change password while logged in)
router.put("/profile/password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  const users = readJSON("users");
  const idx = users.findIndex(u => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: "User not found." });

  if (!bcrypt.compareSync(currentPassword, users[idx].passwordHash)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  users[idx].passwordHash = bcrypt.hashSync(newPassword, 10);
  writeJSON("users", users);

  return res.json({ message: "Password changed successfully." });
});

// POST /api/auth/saved-packages/:packageId — toggle save/unsave (wishlist)
router.post("/saved-packages/:packageId", requireAuth, (req, res) => {
  const users = readJSON("users");
  const idx = users.findIndex(u => u.id === req.userId);
  if (idx === -1) return res.status(404).json({ error: "User not found." });

  const saved = users[idx].savedPackages || [];
  const packageId = req.params.packageId;
  const alreadySaved = saved.includes(packageId);

  users[idx].savedPackages = alreadySaved
    ? saved.filter(id => id !== packageId)
    : [...saved, packageId];

  writeJSON("users", users);
  res.json({ savedPackages: users[idx].savedPackages, saved: !alreadySaved });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const users = readJSON("users");
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Always respond with a generic message so we don't reveal which emails exist.
  const genericResponse = { message: "If an account exists for this email, a reset link has been generated." };

  if (!user) {
    return res.json(genericResponse);
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  const tokens = readJSON("resetTokens");
  const filtered = tokens.filter(t => t.userId !== user.id); // remove old tokens for this user
  filtered.push({ token, userId: user.id, expiresAt });
  writeJSON("resetTokens", filtered);

  // ⚠️ DEV-ONLY NOTE:
  // In production this token/link must be emailed to the user, never returned in the API response.
  // We return it here temporarily (v0.2) because email sending isn't set up yet.
  // The frontend's "Forgot Password" page displays it on-screen just for local testing.
  return res.json({
    ...genericResponse,
    devOnlyResetLink: `/reset-password?token=${token}`
  });
});

// POST /api/auth/reset-password
router.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const tokens = readJSON("resetTokens");
  const entry = tokens.find(t => t.token === token);
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).json({ error: "This reset link is invalid or has expired." });
  }

  const users = readJSON("users");
  const idx = users.findIndex(u => u.id === entry.userId);
  if (idx === -1) return res.status(404).json({ error: "User not found." });

  users[idx].passwordHash = bcrypt.hashSync(newPassword, 10);
  writeJSON("users", users);
  writeJSON("resetTokens", tokens.filter(t => t.token !== token));

  return res.json({ message: "Password reset successfully. Please log in." });
});

module.exports = router;
