import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiGrid, FiPackage, FiCalendar, FiUsers, FiStar, FiImage, FiShield, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: <FiGrid />, end: true },
  { to: "/admin/packages", label: "Packages", icon: <FiPackage /> },
  { to: "/admin/bookings", label: "Bookings", icon: <FiCalendar /> },
  { to: "/admin/users", label: "Users", icon: <FiUsers /> },
  { to: "/admin/reviews", label: "Reviews", icon: <FiStar /> },
  { to: "/admin/gallery", label: "Gallery", icon: <FiImage /> }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  function handleLogoutConfirmed() {
    logout();
    navigate("/");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand"><FiShield /> Atlasmiles <span>Admin</span></div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? "active" : ""}>
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <p>{user?.name}</p>
          <button className="link-button" onClick={() => setConfirmingLogout(true)}><FiLogOut /> Logout</button>
        </div>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out of Admin Panel?"
        message="You'll need to log back in with the Admin toggle to return here."
        confirmLabel="Log Out"
        danger
        onConfirm={handleLogoutConfirmed}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
