import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMapPin, FiShield, FiHeadphones, FiStar, FiSearch, FiLock, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import RouteMap from "../components/RouteMap";
import FaqItem from "../components/FaqItem";

const TESTIMONIALS = [
  { name: "Aditi Rao", initials: "AR", text: "Booking was so smooth — the itinerary matched exactly what was promised. Our Kerala trip felt handled from start to finish.", rating: 5 },
  { name: "Rohan Mehta", initials: "RM", text: "Went with the Rajasthan Royal Trail with my family. Every hotel and transfer was exactly on time. Would book again.", rating: 5 },
  { name: "Sneha Kulkarni", initials: "SK", text: "Loved how transparent the pricing was — no surprise charges at checkout. The Manali trip highlights were spot on.", rating: 4 }
];

const FAQS = [
  { q: "How does booking actually work?", a: "Pick a package, choose your date and number of travellers, review the total, and pay securely online. You'll get an instant confirmation with a transaction ID, and the booking shows up in \"My Bookings\" right away." },
  { q: "Is payment on this site secure?", a: "Yes — payments are processed through a dedicated payment step, and Atlasmiles never stores your card details directly. We're currently running in sandbox/test mode while the site is in development." },
  { q: "Can I cancel a booking after paying?", a: "Yes, from \"My Bookings\" any time before your trip. Cancellation follows our standard policy — refunds for paid bookings are currently handled manually by our team while automatic refunds are being built." },
  { q: "Do I need an account to browse packages?", a: "No — browsing destinations and packages is open to everyone. You only need an account to save packages to your wishlist, book a trip, or leave a review." }
];

function Stars({ count }) {
  return <span className="testimonial-stars">{"★".repeat(count)}{"☆".repeat(5 - count)}</span>;
}

export default function Home() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getPackages()
      .then((data) => setPackages(data.packages.slice(0, 3)))
      .catch(() => setError("Couldn't load featured packages right now."));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/packages?search=${encodeURIComponent(searchInput)}`);
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">Handpicked trips, booked online</span>
          <h1>Discover trips worth remembering.</h1>
          <p>From backwater sunsets to desert nights under the stars — Atlasmiles plans it, you just show up.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <FiSearch style={{ color: "white", marginLeft: "0.4rem" }} />
            <input
              placeholder="Search 'Goa' or 'Kerala'..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <div className="hero-actions">
            <Link to="/packages" className="btn btn-primary">Explore Packages</Link>
            {user ? (
              <Link to="/profile" className="btn btn-secondary">My Profile</Link>
            ) : (
              <Link to="/register" className="btn btn-secondary">Create an Account</Link>
            )}
          </div>
        </div>
        <RouteMap />
      </section>

      <div className="stats-bar">
        <div className="stat-card"><div className="stat-number">4</div><div className="stat-label">Curated Destinations</div></div>
        <div className="stat-card"><div className="stat-number">500+</div><div className="stat-label">Happy Travellers</div></div>
        <div className="stat-card"><div className="stat-number">4.8★</div><div className="stat-label">Average Rating</div></div>
        <div className="stat-card"><div className="stat-number">24/7</div><div className="stat-label">Trip Support</div></div>
      </div>

      <div className="trust-strip">
        <div className="trust-item"><FiLock /> Secure Checkout</div>
        <div className="trust-item"><FiCheckCircle /> Verified Packages</div>
        <div className="trust-item"><FiRefreshCw /> Easy Cancellation</div>
        <div className="trust-item"><FiHeadphones /> Real Human Support</div>
      </div>

      <section className="section">
        <div className="section-heading">
          <h2>Featured Packages</h2>
          <p>A few of our most-booked trips this season — each one planned down to the last transfer.</p>
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="card-grid">
          {packages.map((p, idx) => (
            <div className="card" key={p.id}>
              <div className="card-image-wrap">
                <img src={p.image} alt={p.name} />
                {idx === 0 && <span className="card-badge">Bestseller</span>}
              </div>
              <div className="card-body">
                <h3>{p.name}</h3>
                <p className="muted">{p.destination} · {p.duration}</p>
                <p className="card-rating"><FiStar /> 4.{7 - idx} <span className="count">(120+ reviews)</span></p>
                <p>{p.shortDescription}</p>
                <div className="card-footer">
                  <span className="price">₹{p.price.toLocaleString("en-IN")}</span>
                  <Link to={`/packages/${p.id}`} className="btn btn-small">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>How It Works</h2>
          <p>From browsing to boarding, in four steps.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card"><div className="step-number">1</div><h4>Browse</h4><p>Explore packages by destination, budget, and dates.</p></div>
          <div className="step-card"><div className="step-number">2</div><h4>Book</h4><p>Pick your date and traveller count — see the full price upfront.</p></div>
          <div className="step-card"><div className="step-number">3</div><h4>Pay</h4><p>Secure checkout with instant confirmation and a receipt.</p></div>
          <div className="step-card"><div className="step-number">4</div><h4>Travel</h4><p>Get trip updates in real time and leave a review after.</p></div>
        </div>
      </section>

      <section className="section why-section">
        <div className="section-heading">
          <h2>Why Choose Atlasmiles</h2>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon"><FiMapPin /></div>
            <h4>Curated Packages</h4>
            <p>Every trip is planned and vetted by our own team, not resold from a marketplace.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><FiShield /></div>
            <h4>Transparent Pricing</h4>
            <p>No hidden charges — inclusions and exclusions are listed upfront, every time.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><FiHeadphones /></div>
            <h4>Real Support</h4>
            <p>A dedicated team to help before, during, and after your trip — not a chatbot.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>What Travellers Say</h2>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <Stars count={t.rating} />
              <p className="testimonial-quote">"{t.text}"</p>
              <div className="testimonial-person">
                <div className="testimonial-avatar">{t.initials}</div>
                <span>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section narrow">
        <div className="section-heading">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f) => <FaqItem key={f.q} question={f.q} answer={f.a} />)}
        </div>
      </section>

      <section className="section">
        <div className="newsletter-banner">
          <div>
            <h3>Get trip deals in your inbox</h3>
            <p>Early access to new packages and seasonal discounts. No spam.</p>
          </div>
          <form
            className="newsletter-form"
            onSubmit={(e) => { e.preventDefault(); alert("Newsletter signup is coming soon!"); }}
          >
            <input type="email" placeholder="you@example.com" required />
            <button className="btn btn-primary" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
