import { useEffect, useState, Fragment } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { api } from "../../api";

const STATUS_OPTIONS = ["pending_payment", "confirmed", "cancelled"];
const TRIP_OPTIONS = ["upcoming", "departed", "in_progress", "completed"];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [announcementDrafts, setAnnouncementDrafts] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  function load() {
    api.admin.getBookings().then((data) => setBookings(data.bookings)).catch(() => setError("Couldn't load bookings."));
  }
  useEffect(() => { load(); }, []);

  async function handleStatusChange(id, status) {
    try {
      await api.admin.updateBookingStatus(id, status);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleTripStatusChange(id, tripStatus) {
    try {
      await api.admin.updateTripStatus(id, { tripStatus, announcement: announcementDrafts[id] || "" });
      setAnnouncementDrafts({ ...announcementDrafts, [id]: "" });
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <h1 className="admin-page-title">Bookings</h1>
      {error && <p className="error-text">{error}</p>}

      <table className="data-table">
        <thead>
          <tr><th>Package</th><th>Contact</th><th>Date</th><th>Amount</th><th>Status</th><th>Trip Status</th><th>Post Update</th><th>Travellers</th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <Fragment key={b.id}>
              <tr>
                <td>{b.packageName}</td>
                <td>{b.leadName}<br /><span className="muted">{b.leadPhone}</span></td>
                <td>{new Date(b.date).toDateString()}</td>
                <td>₹{b.totalAmount.toLocaleString("en-IN")}</td>
                <td>
                  <select value={b.status} onChange={(e) => handleStatusChange(b.id, e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </td>
                <td>
                  {b.status === "confirmed" ? (
                    <select value={b.tripStatus || "upcoming"} onChange={(e) => handleTripStatusChange(b.id, e.target.value)}>
                      {TRIP_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  ) : <span className="muted">—</span>}
                </td>
                <td>
                  {b.status === "confirmed" && (
                    <input
                      placeholder="Optional announcement"
                      style={{ width: "160px", padding: "0.4rem", borderRadius: "6px", border: "1px solid var(--border)" }}
                      value={announcementDrafts[b.id] || ""}
                      onChange={(e) => setAnnouncementDrafts({ ...announcementDrafts, [b.id]: e.target.value })}
                    />
                  )}
                </td>
                <td>
                  <button className="btn btn-small" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                    {b.travellers} {expandedId === b.id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </td>
              </tr>
              {expandedId === b.id && (
                <tr>
                  <td colSpan={8} style={{ background: "var(--bg)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", padding: "0.5rem 0" }}>
                      {(b.travellerDetails || []).map((t, i) => (
                        <div key={i} className="traveller-card" style={{ minWidth: "220px", margin: 0 }}>
                          <p className="traveller-card-title">Traveller {i + 1}</p>
                          <p style={{ margin: "0.2rem 0" }}>{t.name}, {t.age} yrs</p>
                          <p className="muted" style={{ margin: "0.2rem 0" }}>{t.idProofType}: {t.idProofNumber}</p>
                          {t.phone && <p className="muted" style={{ margin: "0.2rem 0" }}>Ph: {t.phone}</p>}
                          {t.email && <p className="muted" style={{ margin: "0.2rem 0" }}>{t.email}</p>}
                        </div>
                      ))}
                      {(!b.travellerDetails || b.travellerDetails.length === 0) && (
                        <p className="muted">No traveller details recorded for this booking (created before this feature was added).</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
