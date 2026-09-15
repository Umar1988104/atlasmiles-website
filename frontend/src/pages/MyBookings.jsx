import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUS_LABEL = { pending_payment: "Payment Pending", confirmed: "Confirmed", cancelled: "Cancelled" };
const TRIP_LABEL = { upcoming: "Upcoming", departed: "Departed", in_progress: "In Progress", completed: "Completed" };

function daysUntil(dateStr) {
  const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api.getBookings().then((data) => setBookings(data.bookings)).catch(() => setError("Couldn't load your bookings."));
  }

  useEffect(() => { load(); }, []);

  async function handleConfirmCancel() {
    setBusy(true);
    try {
      await api.cancelBooking(cancelTarget);
      setCancelTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
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
              {b.tripUpdates && b.tripUpdates.length > 0 && (
                <p className="muted" style={{ fontStyle: "italic" }}>Latest update: {b.tripUpdates[0].message}</p>
              )}
            </div>
            {b.status === "confirmed" && b.tripStatus === "upcoming" && daysUntil(b.date) >= 0 && (
              <span className="countdown-badge">
                {daysUntil(b.date) === 0 ? "Today!" : `${daysUntil(b.date)} day${daysUntil(b.date) > 1 ? "s" : ""} to go`}
              </span>
            )}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className={`status-pill status-${b.status}`}>{STATUS_LABEL[b.status]}</span>
              {b.status === "confirmed" && b.tripStatus && (
                <span className="status-pill status-confirmed">{TRIP_LABEL[b.tripStatus]}</span>
              )}
            </div>
            <span className="price">₹{b.totalAmount.toLocaleString("en-IN")}</span>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {b.status === "pending_payment" && (
                <Link to={`/payment/${b.id}`} className="btn btn-small">Pay Now</Link>
              )}
              {b.status !== "cancelled" && (
                <button className="btn btn-danger" onClick={() => setCancelTarget(b.id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this booking?"
        message="This can't be undone. Any payment made will need to be refunded manually for now (automatic refunds arrive with the real payment gateway)."
        confirmLabel={busy ? "Cancelling..." : "Cancel Booking"}
        danger
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
