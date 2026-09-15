import { useEffect, useState } from "react";
import { FiUsers, FiCalendar, FiCheckCircle, FiStar, FiDollarSign } from "react-icons/fi";
import { api } from "../../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.getStats().then(setStats).catch(() => setError("Couldn't load dashboard stats."));
  }, []);

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>
      {error && <p className="error-text">{error}</p>}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card"><FiUsers /><div><div className="stat-number">{stats.totalUsers}</div><div className="stat-label">Registered Travellers</div></div></div>
          <div className="admin-stat-card"><FiCalendar /><div><div className="stat-number">{stats.totalBookings}</div><div className="stat-label">Total Bookings</div></div></div>
          <div className="admin-stat-card"><FiCheckCircle /><div><div className="stat-number">{stats.confirmedBookings}</div><div className="stat-label">Confirmed Bookings</div></div></div>
          <div className="admin-stat-card"><FiStar /><div><div className="stat-number">{stats.pendingReviews}</div><div className="stat-label">Reviews Awaiting Approval</div></div></div>
          <div className="admin-stat-card"><FiDollarSign /><div><div className="stat-number">₹{stats.totalRevenue.toLocaleString("en-IN")}</div><div className="stat-label">Total Revenue (sandbox)</div></div></div>
        </div>
      )}
    </div>
  );
}
