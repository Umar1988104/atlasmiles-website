import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">Atlasmiles</Link>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/destinations">Destinations</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/about">About</Link>
        {user ? (
          <>
            {user.role === "admin" ? (
              <Link to="/admin">Admin Panel</Link>
            ) : (
              <>
                <Link to="/my-bookings">My Bookings</Link>
                <Link to="/profile">My Profile</Link>
              </>
            )}
            <button className="link-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="cta-link">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
