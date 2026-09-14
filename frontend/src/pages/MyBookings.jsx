import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const STATUS_LABEL = {
  pending_payment: "Payment Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled"
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    api.getBookings().then((data) => setBookings(data.bookings)).catch(() => setError("Couldn't load your bookings."));
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    setBusyId(id);
    try {
      await api.cancelBooking(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="section">
      <h1>My Bookings</h1>
      {error && <p className="error-text">{error}</p>}

      {bookings.length === 0 && !error && (
        <p className="muted">No bookings yet. <Link to="/packages">Browse packages</Link> to get started.</p>
      )}

      <div className="booking-list">
        {bookings.map((b) => (
          <div className="booking-row" key={b.id}>
            <div>
              <strong>{b.packageName}</strong>
              <p className="muted">{b.destination} · {new Date(b.date).toDateString()} · {b.travellers} traveller{b.travellers > 1 ? "s" : ""}</p>
            </div>
            <span className={`status-pill status-${b.status}`}>{STATUS_LABEL[b.status]}</span>
            <span className="price">₹{b.totalAmount.toLocaleString("en-IN")}</span>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {b.status === "pending_payment" && (
                <Link to={`/payment/${b.id}`} className="btn btn-small">Pay Now</Link>
              )}
              {b.status !== "cancelled" && (
                <button className="btn btn-danger" onClick={() => handleCancel(b.id)} disabled={busyId === b.id}>
                  {busyId === b.id ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
