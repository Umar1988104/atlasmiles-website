import { FiShield } from "react-icons/fi";

export default function AdminHome() {
  return (
    <div className="section narrow admin-shell">
      <div className="admin-icon"><FiShield /></div>
      <h1>Admin Dashboard</h1>
      <p className="muted">
        You're logged in as an admin. The full admin dashboard — package management,
        booking management, payment overview, and user management — arrives in v0.4.
      </p>
      <p className="muted">For now, this confirms admin login and role-based access are working correctly.</p>
    </div>
  );
}
