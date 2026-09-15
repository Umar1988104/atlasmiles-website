import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiStar, FiUsers, FiCalendar, FiHeart, FiMessageCircle, FiShield } from "react-icons/fi";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "911234567890";

export default function PackageDetails() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState("");
  const { user, updateUserInState } = useAuth();
  const navigate = useNavigate();
  const [savingWishlist, setSavingWishlist] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    api
      .getPackage(id)
      .then((data) => setPkg(data.package))
      .catch(() => setError("This package could not be found."));
    api.getPackageReviews(id).then((data) => setReviews(data.reviews)).catch(() => {});

    if (user && user.role !== "admin") {
      api.getBookings().then((data) => {
        const eligible = data.bookings.some(
          (b) => b.packageId === id && b.status === "confirmed" && b.tripStatus === "completed"
        );
        setCanReview(eligible);
      }).catch(() => {});
    }
  }, [id, user]);

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError(""); setReviewMessage("");
    try {
      await api.submitReview({ packageId: id, rating: reviewForm.rating, comment: reviewForm.comment });
      setReviewMessage("Thanks! Your review is awaiting approval and will appear here once approved.");
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      setReviewError(err.message);
    }
  }

  function handleBookNow() {
    if (!user) {
      navigate("/login", { state: { redirectTo: `/booking/${id}` } });
      return;
    }
    navigate(`/booking/${id}`);
  }

  async function handleToggleSave() {
    if (!user) {
      navigate("/login", { state: { redirectTo: `/packages/${id}` } });
      return;
    }
    setSavingWishlist(true);
    try {
      const data = await api.toggleSavedPackage(id);
      updateUserInState({ ...user, savedPackages: data.savedPackages });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingWishlist(false);
    }
  }

  if (error) {
    return (
      <div className="section narrow">
        <p className="error-text">{error}</p>
        <Link to="/packages" className="btn btn-small">Back to Packages</Link>
      </div>
    );
  }

  if (!pkg) return <p className="page-loading">Loading...</p>;

  const seatsPercent = Math.min(100, Math.round((pkg.seatsAvailable / 25) * 100));
  const isSaved = user?.savedPackages?.includes(id) || false;

  return (
    <div className="section">
      <Link to="/packages" className="back-link"><FiArrowLeft /> Back to Packages</Link>

      <div className="pkg-hero">
        <img src={pkg.images[0]} alt={pkg.name} />
        <div className="pkg-hero-overlay">
          <div className="pkg-badge-row">
            <span className="pkg-badge">{pkg.destination}</span>
            <span className="pkg-badge">{pkg.duration}</span>
            <span className="pkg-badge"><FiStar style={{ verticalAlign: "-2px" }} /> 4.7 (120+ reviews)</span>
          </div>
          <h1>{pkg.name}</h1>
          <p className="muted">{pkg.shortDescription}</p>
        </div>
      </div>

      <div className="pkg-layout">
        <div className="pkg-main">
          <div className="pkg-block">
            <h3>Highlights</h3>
            <div className="highlight-chips">
              {pkg.highlights.map((h, i) => (
                <span className="highlight-chip" key={i}><FiCheck /> {h}</span>
              ))}
            </div>
          </div>

          <div className="pkg-block">
            <h3>Gallery</h3>
            <div className="gallery-grid">
              <img className="gallery-main" src={pkg.images[0]} alt={`${pkg.name} main`} />
              {pkg.images.slice(1).concat(pkg.images).slice(0, 2).map((img, i) => (
                <img className="gallery-thumb" key={i} src={img} alt={`${pkg.name} ${i + 2}`} />
              ))}
            </div>
          </div>

          <div className="pkg-block">
            <h3>Day-by-Day Itinerary</h3>
            <div className="timeline">
              {pkg.itinerary.map((step) => (
                <div className="timeline-item" key={step.day}>
                  <strong>Day {step.day}: {step.title}</strong>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pkg-block">
            <h3>What's Included</h3>
            <div className="two-col-list">
              <div>
                <p className="muted" style={{ marginBottom: "0.6rem" }}>Inclusions</p>
                <ul className="checklist include">
                  {pkg.inclusions.map((i, idx) => <li key={idx}><FiCheck /> {i}</li>)}
                </ul>
              </div>
              <div>
                <p className="muted" style={{ marginBottom: "0.6rem" }}>Exclusions</p>
                <ul className="checklist exclude">
                  {pkg.exclusions.map((i, idx) => <li key={idx}><FiX /> {i}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="pkg-block">
            <h3>Traveller Reviews</h3>
            {reviews.length === 0 ? (
              <p className="muted">No reviews yet — be the first to share how your trip went.</p>
            ) : (
              <div className="testimonial-grid">
                {reviews.map((r) => (
                  <div className="testimonial-card" key={r.id}>
                    <span className="testimonial-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <p className="testimonial-quote">"{r.comment}"</p>
                    <div className="testimonial-person">
                      <div className="testimonial-avatar">{r.userName[0]}</div>
                      <span>{r.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user && user.role !== "admin" && canReview && (
              <form onSubmit={handleReviewSubmit} className="auth-form" style={{ marginTop: "1.5rem", borderTop: "1px dashed var(--border)", paddingTop: "1.2rem" }}>
                <h4 style={{ marginBottom: "0.4rem" }}>Leave a Review</h4>
                {reviewError && <p className="error-text">{reviewError}</p>}
                {reviewMessage && <p className="success-text">{reviewMessage}</p>}
                <label>Rating
                  <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>)}
                  </select>
                </label>
                <label>Comment
                  <input value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required placeholder="How was your trip?" />
                </label>
                <button className="btn btn-small" type="submit">Submit Review</button>
              </form>
            )}
            {user && user.role !== "admin" && !canReview && (
              <p className="muted" style={{ marginTop: "1.2rem", borderTop: "1px dashed var(--border)", paddingTop: "1rem" }}>
                Only travellers with a completed trip on this package can leave a review — this keeps reviews genuine.
              </p>
            )}
          </div>

          <div className="pkg-block">
            <h3><FiShield style={{ verticalAlign: "-2px" }} /> Cancellation Policy</h3>
            <ul className="checklist include">
              <li><FiCheck /> Full refund if cancelled 7+ days before the travel date</li>
              <li><FiCheck /> 50% refund if cancelled 3–7 days before the travel date</li>
              <li><FiX /> No refund for cancellations within 3 days of travel</li>
            </ul>
            <p className="muted" style={{ marginTop: "0.6rem" }}>Refunds for sandbox/test bookings are currently processed manually by our team.</p>
          </div>
        </div>

        <aside className="booking-sidebar">
          <div className="price-row">
            <span className="price">₹{pkg.price.toLocaleString("en-IN")}</span>
            <span className="muted">/ person</span>
          </div>

          <div>
            <div className="seats-bar"><div className="seats-fill" style={{ width: `${seatsPercent}%` }} /></div>
            <p className="seats-text"><FiUsers style={{ verticalAlign: "-2px" }} /> {pkg.seatsAvailable} seats left</p>
          </div>

          <div>
            <p className="muted" style={{ marginBottom: "0.4rem" }}><FiCalendar style={{ verticalAlign: "-2px" }} /> Available dates</p>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.9rem" }}>
              {pkg.dates.slice(0, 3).map((d, i) => <li key={i}>{new Date(d).toDateString()}</li>)}
            </ul>
          </div>

          <button className="btn btn-primary btn-block" onClick={handleBookNow}>Book Now</button>
          <button className="btn btn-outline btn-block" onClick={handleToggleSave} disabled={savingWishlist}>
            <FiHeart style={{ fill: isSaved ? "var(--coral)" : "none", color: "var(--coral)" }} />
            {isSaved ? "Saved to Wishlist" : "Save for Later"}
          </button>
          <a
            className="whatsapp-btn btn-block"
            style={{ justifyContent: "center" }}
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I have a question about the "${pkg.name}" package.`)}`}
            target="_blank"
            rel="noreferrer"
          >
            <FiMessageCircle /> Ask on WhatsApp
          </a>
          <p className="muted" style={{ fontSize: "0.8rem", textAlign: "center" }}>No payment charged until you confirm on the next step.</p>
        </aside>
      </div>
    </div>
  );
}
