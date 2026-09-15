import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const ID_PROOF_TYPES = ["Aadhaar", "Passport", "Voter ID", "Driving License"];
const BLANK_TRAVELLER = { name: "", age: "", idProofType: "Aadhaar", idProofNumber: "", phone: "", email: "" };

export default function BookingForm() {
  const { packageId } = useParams();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: "",
    travellers: 1,
    leadName: user?.name || "",
    leadPhone: user?.phone || ""
  });
  const [travellerDetails, setTravellerDetails] = useState([{ ...BLANK_TRAVELLER, name: user?.name || "" }]);

  useEffect(() => {
    api.getPackage(packageId).then((data) => {
      setPkg(data.package);
      setForm((f) => ({ ...f, date: data.package.dates[0] }));
    }).catch(() => setError("This package could not be found."));
  }, [packageId]);

  // Keep the travellerDetails array in sync with the traveller count —
  // add blank rows when the count goes up, trim from the end when it goes down.
  function handleTravellerCountChange(value) {
    const count = Math.max(1, Number(value) || 1);
    setForm({ ...form, travellers: count });
    setTravellerDetails((prev) => {
      const next = [...prev];
      while (next.length < count) next.push({ ...BLANK_TRAVELLER });
      while (next.length > count) next.pop();
      return next;
    });
  }

  function updateTraveller(index, field, value) {
    setTravellerDetails((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.createBooking({
        packageId,
        ...form,
        travellers: Number(form.travellers),
        travellerDetails
      });
      navigate(`/payment/${data.booking.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (error && !pkg) {
    return (
      <div className="section narrow">
        <p className="error-text">{error}</p>
        <Link to="/packages" className="btn btn-small">Back to Packages</Link>
      </div>
    );
  }
  if (!pkg) return <p className="page-loading">Loading...</p>;

  const total = pkg.price * Number(form.travellers || 0);

  return (
    <div className="section narrow">
      <Link to={`/packages/${pkg.id}`} className="back-link"><FiArrowLeft /> Back to {pkg.name}</Link>
      <div className="auth-card auth-form">
        <h1>Book {pkg.name}</h1>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Travel Date
            <select value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required>
              {pkg.dates.map((d) => (
                <option key={d} value={d}>{new Date(d).toDateString()}</option>
              ))}
            </select>
          </label>
          <label>Number of Travellers
            <input
              type="number"
              min="1"
              max={pkg.seatsAvailable}
              value={form.travellers}
              onChange={(e) => handleTravellerCountChange(e.target.value)}
              required
            />
          </label>
          <label>Booking Contact Name
            <input value={form.leadName} onChange={(e) => setForm({ ...form, leadName: e.target.value })} required />
          </label>
          <label>Booking Contact Phone
            <input value={form.leadPhone} onChange={(e) => setForm({ ...form, leadPhone: e.target.value })} required />
          </label>

          <div className="traveller-details-block">
            <h4>Traveller Details</h4>
            <p className="muted" style={{ marginBottom: "0.8rem" }}>Required for hotel check-in and travel ID verification.</p>
            {travellerDetails.map((t, idx) => (
              <div className="traveller-card" key={idx}>
                <p className="traveller-card-title">Traveller {idx + 1}</p>
                <div className="admin-inline-form">
                  <label>Full Name<input value={t.name} onChange={(e) => updateTraveller(idx, "name", e.target.value)} required /></label>
                  <label>Age<input type="number" min="0" max="120" value={t.age} onChange={(e) => updateTraveller(idx, "age", e.target.value)} required /></label>
                  <label>ID Proof Type
                    <select value={t.idProofType} onChange={(e) => updateTraveller(idx, "idProofType", e.target.value)}>
                      {ID_PROOF_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </label>
                  <label>ID Proof Number<input value={t.idProofNumber} onChange={(e) => updateTraveller(idx, "idProofNumber", e.target.value)} required /></label>
                  <label>Phone (optional)<input value={t.phone} onChange={(e) => updateTraveller(idx, "phone", e.target.value)} /></label>
                  <label>Email (optional)<input type="email" value={t.email} onChange={(e) => updateTraveller(idx, "email", e.target.value)} /></label>
                </div>
              </div>
            ))}
          </div>

          <div className="payment-summary">
            <div className="payment-summary-row"><span>Price per person</span><span>₹{pkg.price.toLocaleString("en-IN")}</span></div>
            <div className="payment-summary-row"><span>Travellers</span><span>{form.travellers || 0}</span></div>
            <div className="payment-summary-row"><strong>Total</strong><strong>₹{total.toLocaleString("en-IN")}</strong></div>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Creating booking..." : "Continue to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
