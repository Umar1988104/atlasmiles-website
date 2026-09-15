require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/auth");
const packagesRoutes = require("./src/packages");
const destinationsRoutes = require("./src/destinations");
const bookingsRoutes = require("./src/bookings");
const notificationsRoutes = require("./src/notifications");
const reviewsRoutes = require("./src/reviews");
const galleryRoutes = require("./src/gallery");
const adminRoutes = require("./src/admin");
const { seedAdminIfNeeded } = require("./src/seedAdmin");
const { seedGalleryIfNeeded } = require("./src/seedGallery");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "0.5.0" });
});

app.use("/api/auth", authRoutes);
app.use("/api/packages", packagesRoutes);
app.use("/api/destinations", destinationsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

seedAdminIfNeeded();
seedGalleryIfNeeded();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Atlasmiles backend running at http://localhost:${PORT}`);
});
