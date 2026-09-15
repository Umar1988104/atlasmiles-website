# Atlasmiles Website — v0.1 through v0.5

## This package contains
- **v0.1** — Public pages (Home, About, Destinations, Packages, Package Details) using test data.
- **v0.2** — Registration (auto-login), login, forgot/reset password, profile management.
- **v0.3** — Full booking flow with sandbox payment, "My Bookings" with cancel, Admin/Traveller login toggle.
- **v0.4** — A real Admin Dashboard: manage packages (add/edit/delete/duplicate, full control over images/highlights/inclusions/itinerary), manage bookings (status, trip status with announcements), manage users (disable/enable), dark sidebar layout.
- **v0.5** — Public Gallery, review system (submit → admin approves → public), trip status tracking, in-app notifications, wishlist (save packages), printable receipts, richer Home page (search, trust badges, How It Works, FAQ).
- **Batch 1 (new)** — Per-traveller booking details with ID proof, reviews restricted to completed trips, cancellation policy, WhatsApp inquiry button, trip countdown.

## What's new in this update
- **Per-traveller details at booking:** for each traveller, name, age, ID proof (Aadhaar/Passport/Voter ID/Driving License), and optional phone/email are now collected — required for real hotel check-ins. ID numbers are **masked in the admin view** (e.g. `••••••••9012`) for basic privacy.
- **Reviews are now restricted** to travellers whose trip has actually been marked "Completed" by admin — no more reviews from people who never took the trip.
- **Cancellation policy** is now shown on every package page.
- **Click-to-WhatsApp button** on package pages — set your real number in `frontend/.env` (`VITE_WHATSAPP_NUMBER`).
- **Trip countdown** on My Bookings — "5 days to go!" for upcoming confirmed trips.

---

## 1. Prerequisites

You need **Node.js** installed (version 18 or higher). Check with:
```
node -v
```
If missing, install the LTS version from https://nodejs.org, then reopen Command Prompt.

---

## 2. First-Time Setup

Extract the zip fully first (right-click → Extract All), then open Command Prompt and navigate into the extracted `atlasmiles-website` folder using `cd` (see the previous setup guide if you need a refresher on finding the exact path).

### Backend
```
cd atlasmiles-website\backend && copy .env.example .env && npm install
```

### Frontend (second Command Prompt window)
```
cd atlasmiles-website\frontend && copy .env.example .env && npm install
```

---

## 3. Running the Website

**Window 1 — backend**
```
cd atlasmiles-website\backend && npm run dev
```
Watch this window's very first output — it prints a **default admin login** (email + password) the first time it ever runs. Copy those down.

**Window 2 — frontend**
```
cd atlasmiles-website\frontend && npm run dev
```
Open the printed URL (usually http://localhost:5173) in your browser.

---

## 4. What You Can Test Now

- Everything from v0.1–v0.5 (browsing, register, login, booking, payment, admin panel, reviews, gallery, wishlist, receipts, notifications)
- **Traveller details:** when booking, fill in each traveller's name, age, and ID proof — try changing the traveller count and watch the form add/remove rows
- **Review gating:** try reviewing a package you haven't completed a trip for — it'll now say only completed-trip travellers can review. Have admin mark a booking's trip status as "Completed," then try again.
- **Cancellation policy:** scroll down any package page to see it
- **WhatsApp button:** on a package page, click "Ask on WhatsApp" (update `VITE_WHATSAPP_NUMBER` in `frontend/.env` to your real number first, or it'll use a placeholder)
- **Trip countdown:** book and pay for a trip, then check My Bookings for the "X days to go" badge
- **Admin — masked ID numbers:** in Admin → Bookings, click the traveller count on any row to expand and see traveller details with ID numbers masked (e.g. `••••••••9012`)
- Search, wishlist, receipts, rich admin package form, admin dashboard, gallery, reviews, notifications — all from the previous update, still here

**Important:** change the default admin password (via Profile → Security, after logging in as admin) before this goes anywhere near a real deployment.

---

## 5. Stopping the Servers

`Ctrl + C` in each Command Prompt window.

---

## 6. Pushing This Update to GitHub

You've already got the repo set up and pushed once before — this is just the "every version after the first" flow:
```
git add . && git commit -m "Batch 1: traveller ID details, review gating, cancellation policy, WhatsApp button, trip countdown" && git push
```
Optional but recommended — tag it so you can jump back to this exact point later:
```
git tag batch1 && git push --tags
```

If you ever need the full first-time walkthrough again (e.g. on a new machine), it's:
```
git init && git add . && git commit -m "message"
```
then create a repo at https://github.com/new, copy its URL, and:
```
git branch -M main && git remote add origin PASTE_YOUR_GITHUB_URL_HERE && git push -u origin main
```

---

## 7. Every Version After This

Same recipe every time:
```
git add . && git commit -m "describe what changed" && git push
```
And tag it if it's a meaningful checkpoint:
```
git tag v0.6 && git push --tags
```

---

## 8. What's Next

**Batch 2 (Discovery & Conversion)** is next: an illustrated animated journey map per package, trip-type and budget filters, package comparison, "you might also like," and a coupon/group-discount system.

**Batch 3 (Growth & Admin Polish)** after that: seasonal deal packages, PDF itinerary download, packing checklist, admin analytics + low-seats alerts, CSV export, and social share.

Still deferred from the original plan either way: real image/file uploads (currently URL-based), and eventually swapping the local JSON data store for a real free-tier Postgres database (Supabase/Neon) before this goes anywhere near a real public launch.
