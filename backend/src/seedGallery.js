const crypto = require("crypto");
const { readJSON, writeJSON } = require("./db");

function seedGalleryIfNeeded() {
  const gallery = readJSON("gallery");
  if (gallery.length > 0) return;

  const seeded = [
    { album: "Destinations", url: "https://picsum.photos/seed/gal-goa/700/500", caption: "Goa coastline" },
    { album: "Destinations", url: "https://picsum.photos/seed/gal-manali/700/500", caption: "Manali mountains" },
    { album: "Customer Trips", url: "https://picsum.photos/seed/gal-kerala/700/500", caption: "Kerala backwaters trip" },
    { album: "Customer Trips", url: "https://picsum.photos/seed/gal-raj/700/500", caption: "Rajasthan desert camp" }
  ].map(img => ({
    id: crypto.randomUUID(),
    ...img,
    published: true,
    createdAt: new Date().toISOString()
  }));

  writeJSON("gallery", seeded);
}

module.exports = { seedGalleryIfNeeded };
