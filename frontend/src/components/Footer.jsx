import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h4>Atlasmiles</h4>
          <p className="muted" style={{ color: "#cfc8e6" }}>Curated trips, booked simply. Wherever the map points, we've probably already been.</p>
          <div className="social-row">
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/destinations">Destinations</Link></li>
            <li><Link to="/packages">Packages</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p style={{ fontSize: "0.9rem" }}>hello@atlasmiles.com</p>
          <p style={{ fontSize: "0.9rem" }}>+91 98XXXXXXXX</p>
        </div>
      </div>
      <div className="footer-bottom">&copy; {new Date().getFullYear()} Atlasmiles. All rights reserved.</div>
    </footer>
  );
}
