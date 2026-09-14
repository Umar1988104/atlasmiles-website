// Simple flat-file JSON "database" for early-stage development.
// No native modules to compile, no external service to set up —
// this keeps v0.1/v0.2 runnable with just `npm install`.
// This will be swapped for Supabase/Neon Postgres before public launch (see report, section 3).

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readJSON(name) {
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8").trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function writeJSON(name, data) {
  const file = filePath(name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readJSON, writeJSON };
