import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiStar, FiUsers, FiCalendar } from "react-icons/fi";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function PackageDetails() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getPackage(id)
      .then((data) => setPkg(data.package))
      .catch(() => setError("This package could not be found."));
  }, [id]);

  function handleBookNow() {
    if (!user) {
      navigate("/login", { state: { redirectTo: `/booking/${id}` } });
      return;
    }
    navigate(`/booking/${id}`);
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
          <p className="muted" style={{ fontSize: "0.8rem", textAlign: "center" }}>No payment charged until you confirm on the next step.</p>
        </aside>
      </div>
    </div>
  );
}
