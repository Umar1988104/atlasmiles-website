import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  function handleLogoutConfirmed() {
    logout();
    setConfirmingLogout(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">Atlasmiles</Link>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/destinations">Destinations</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/about">About</Link>
        {user ? (
          <>
            {user.role === "admin" ? (
              <Link to="/admin">Admin Panel</Link>
            ) : (
              <>
                <Link to="/my-bookings">My Bookings</Link>
                <Link to="/profile">My Profile</Link>
                <NotificationBell />
              </>
            )}
            <button className="link-button" onClick={() => setConfirmingLogout(true)}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="cta-link">Register</Link>
          </>
        )}
      </nav>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        message="You'll need to log in again to access your profile and bookings."
        confirmLabel="Log Out"
        danger
        onConfirm={handleLogoutConfirmed}
        onCancel={() => setConfirmingLogout(false)}
      />
    </header>
  );
}
