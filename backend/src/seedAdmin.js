const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { readJSON, writeJSON } = require("./db");

const DEFAULT_ADMIN_EMAIL = "admin@atlasmiles.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";

// Creates one default admin account on first run so there's an admin
// login to test immediately. This is a dev-only convenience —
// change this password from the Profile page after your first login,
// and never ship a real deployment with this default still active.
function seedAdminIfNeeded() {
  const users = readJSON("users");
  const hasAdmin = users.some(u => u.role === "admin");
  if (hasAdmin) return;

  const admin = {
    id: crypto.randomUUID(),
    name: "Atlasmiles Admin",
    email: DEFAULT_ADMIN_EMAIL,
    phone: "",
    passwordHash: bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10),
    role: "admin",
    disabled: false,
    emailNotifications: true,
    emergencyContactName: "",
    emergencyContactPhone: "",
    savedPackages: [],
    createdAt: new Date().toISOString()
  };

  users.push(admin);
  writeJSON("users", users);

  console.log("\n=== Default admin account created (dev only) ===");
  console.log(`Email:    ${DEFAULT_ADMIN_EMAIL}`);
  console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`);
  console.log("Log in via the 'Admin' tab on the Login page, then change this password from Profile.");
  console.log("==================================================\n");
}

module.exports = { seedAdminIfNeeded };
