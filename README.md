# Atlasmiles Website — v0.1, v0.2 + v0.3

This package contains:
- **v0.1** — Public pages (Home, About, Destinations, Packages, Package Details) using test package data.
- **v0.2** — Customer registration (auto-logs you in), login, forgot/reset password, and profile management.
- **v0.3 (new)** — Full booking flow: pick a date and traveller count, sandbox/test-mode payment, "My Bookings" with cancel, and a separate **Admin login**.

The full admin dashboard (managing packages/bookings/users) is **not** built yet — that's v0.4. Logging in as admin right now takes you to a placeholder page confirming the role-based login works.

**What's new in this update:**
- Full visual redesign — bolder ink-navy-to-coral-and-gold theme, richer content (stats bar, testimonials, newsletter banner on Home), and much more detailed, boxed package pages with a sticky booking sidebar, timeline itinerary, and icon checklists.
- Login page now has a **Traveller / Admin** toggle.
- The full booking → payment → confirmation flow (v0.3).

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

- Everything from v0.1/v0.2 (browsing, register, login, profile)
- **Book a trip:** open any package → Book Now → pick a date and traveller count → Continue to Payment → Pay Now (sandbox — no real charge) → see your confirmed booking
- **My Bookings:** view and cancel bookings from the navbar
- **Admin login:** on the Login page, click the "Admin" toggle, and use the email/password the backend printed in Window 1 on first run. You'll land on a placeholder Admin Dashboard page — this confirms the role-based login works; the real dashboard is v0.4.

**Important:** change the default admin password (via Profile, after logging in as admin) before this ever goes anywhere near a real deployment. It's fine to leave as-is for local testing.

---

## 5. Stopping the Servers

`Ctrl + C` in each Command Prompt window.

---

## 6. Pushing to GitHub — First Time (you haven't done this yet)

Do this from the `atlasmiles-website` folder in Command Prompt (servers can be stopped for this):

**Step 1 — Turn this folder into a Git project**
```
cd atlasmiles-website && git init
```

**Step 2 — Stage and commit everything**
```
git add . && git commit -m "v0.3: booking + payment flow, admin login, full redesign"
```

**Step 3 — Create the GitHub repo**
Go to https://github.com/new in your browser. Give it a name like `atlasmiles-website`. Leave "Add a README" **unchecked** — this project already has one. Click **Create repository**. GitHub will show you a page with a URL like `https://github.com/yourusername/atlasmiles-website.git` — copy it.

**Step 4 — Connect and push**
```
git branch -M main && git remote add origin PASTE_YOUR_GITHUB_URL_HERE && git push -u origin main
```
If GitHub asks you to sign in, follow its prompt (browser popup or a device code) — this only happens the first time.

**Step 5 — Confirm**
Refresh the GitHub repo page in your browser. You should see all your files there.

---

## 7. Every Version After This

Once the repo exists, pushing an update is just:
```
git add . && git commit -m "v0.4: admin dashboard" && git push
```
(swap the message for whatever that version actually added — do this after every completed version, as discussed.)

Optional but recommended — tag each version so you can jump back to it later:
```
git tag v0.3 && git push --tags
```

---

## 8. What's Next (v0.4)

The real admin dashboard: package management, booking management, payment overview, and user management — replacing today's placeholder admin page.
