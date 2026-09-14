import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

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

  useEffect(() => {
    api.getPackage(packageId).then((data) => {
      setPkg(data.package);
      setForm((f) => ({ ...f, date: data.package.dates[0] }));
    }).catch(() => setError("This package could not be found."));
  }, [packageId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.createBooking({ packageId, ...form, travellers: Number(form.travellers) });
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
              onChange={(e) => setForm({ ...form, travellers: e.target.value })}
              required
            />
          </label>
          <label>Lead Traveller Name
            <input value={form.leadName} onChange={(e) => setForm({ ...form, leadName: e.target.value })} required />
          </label>
          <label>Lead Traveller Phone
            <input value={form.leadPhone} onChange={(e) => setForm({ ...form, leadPhone: e.target.value })} required />
          </label>

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
