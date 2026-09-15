import { useEffect, useState } from "react";
import { api } from "../../api";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  function load() {
    api.admin.getReviews().then((data) => setReviews(data.reviews)).catch(() => setError("Couldn't load reviews."));
  }
  useEffect(() => { load(); }, []);

  async function handleStatus(id, status) {
    try {
      await api.admin.updateReviewStatus(id, status);
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <h1 className="admin-page-title">Reviews</h1>
      {error && <p className="error-text">{error}</p>}

      <table className="data-table">
        <thead>
          <tr><th>Package</th><th>Traveller</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.packageName}</td>
              <td>{r.userName}</td>
              <td>{"★".repeat(r.rating)}</td>
              <td style={{ maxWidth: "260px" }}>{r.comment}</td>
              <td><span className={`status-pill status-${r.status === "approved" ? "confirmed" : r.status === "rejected" ? "cancelled" : "pending_payment"}`}>{r.status}</span></td>
              <td className="table-actions">
                {r.status === "pending" && (
                  <>
                    <button className="btn btn-small" onClick={() => handleStatus(r.id, "approved")}>Approve</button>
                    <button className="btn btn-danger" onClick={() => handleStatus(r.id, "rejected")}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
