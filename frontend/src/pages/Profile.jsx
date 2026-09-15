import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiLock, FiSliders, FiGrid, FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import ReceiptModal from "../components/ReceiptModal";

const TABS = [
  { key: "overview", label: "Overview", icon: <FiGrid /> },
  { key: "details", label: "Account Details", icon: <FiUser /> },
  { key: "security", label: "Security", icon: <FiLock /> },
  { key: "preferences", label: "Preferences", icon: <FiSliders /> }
];

export default function Profile() {
  const { user, updateUserInState } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [receiptBooking, setReceiptBooking] = useState(null);

  useEffect(() => {
    api.getBookings().then((data) => setBookings(data.bookings)).catch(() => {});
    api.getPackages().then((data) => setAllPackages(data.packages)).catch(() => {});
  }, []);

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [prefsForm, setPrefsForm] = useState({
    emailNotifications: user?.emailNotifications ?? true,
    emergencyContactName: user?.emergencyContactName || "",
    emergencyContactPhone: user?.emergencyContactPhone || ""
  });
  const [prefsMessage, setPrefsMessage] = useState("");
  const [prefsError, setPrefsError] = useState("");

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError(""); setProfileMessage("");
    try {
      const data = await api.updateProfile(profileForm);
      updateUserInState(data.user);
      setProfileMessage("Profile updated successfully.");
    } catch (err) { setProfileError(err.message); }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError(""); setPasswordMessage("");
    try {
      await api.changePassword(passwordForm);
      setPasswordMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) { setPasswordError(err.message); }
  }

  async function handlePrefsSubmit(e) {
    e.preventDefault();
    setPrefsError(""); setPrefsMessage("");
    try {
      const data = await api.updateProfile(prefsForm);
      updateUserInState(data.user);
      setPrefsMessage("Preferences saved.");
    } catch (err) { setPrefsError(err.message); }
  }

  if (!user) return null;

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const confirmedTrips = bookings.filter((b) => b.status === "confirmed");
  const upcomingTrips = confirmedTrips.filter((b) => b.tripStatus !== "completed");
  const totalSpent = confirmedTrips.reduce((sum, b) => sum + b.totalAmount, 0);
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const savedPackages = allPackages.filter((p) => (user.savedPackages || []).includes(p.id));

  async function handleUnsave(packageId) {
    const data = await api.toggleSavedPackage(packageId);
    updateUserInState({ ...user, savedPackages: data.savedPackages });
  }

  return (
    <div className="section">
      <div className="profile-header">
        <div className="avatar">{initials}</div>
        <div>
          <h1>{user.name}</h1>
          <p className="muted">{user.email}</p>
          {user.role === "admin" && <span className="role-pill">Admin</span>}
        </div>
      </div>

      <div className="profile-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="profile-overview">
          <div className="stats-bar" style={{ marginTop: 0, padding: 0, maxWidth: "none" }}>
            <div className="stat-card"><div className="stat-number">{confirmedTrips.length}</div><div className="stat-label">Total Bookings</div></div>
            <div className="stat-card"><div className="stat-number">{upcomingTrips.length}</div><div className="stat-label">Upcoming Trips</div></div>
            <div className="stat-card"><div className="stat-number">₹{totalSpent.toLocaleString("en-IN")}</div><div className="stat-label">Total Spent</div></div>
            <div className="stat-card"><div className="stat-number">{memberSince}</div><div className="stat-label">Member Since</div></div>
          </div>
          <div className="profile-box" style={{ marginTop: "1.5rem" }}>
            <h3>Recent Bookings</h3>
            {bookings.length === 0 ? (
              <p className="muted">No bookings yet. <Link to="/packages">Browse packages</Link> to get started.</p>
            ) : (
              <div className="booking-list">
                {bookings.slice(0, 3).map((b) => (
                  <div className="booking-row" key={b.id}>
                    <div>
                      <strong>{b.packageName}</strong>
                      <p className="muted">{new Date(b.date).toDateString()}</p>
                    </div>
                    <span className={`status-pill status-${b.status}`}>{b.status.replace("_", " ")}</span>
                    {b.status === "confirmed" && (
                      <button className="btn btn-small" onClick={() => setReceiptBooking(b)}>View Receipt</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-box" style={{ marginTop: "1.5rem" }}>
            <h3><FiHeart style={{ verticalAlign: "-2px", color: "var(--coral)" }} /> Saved Packages</h3>
            {savedPackages.length === 0 ? (
              <p className="muted">Nothing saved yet — tap "Save for Later" on any package to build your wishlist.</p>
            ) : (
              <div className="card-grid">
                {savedPackages.map((p) => (
                  <div className="card" key={p.id}>
                    <div className="card-image-wrap"><img src={p.image} alt={p.name} /></div>
                    <div className="card-body">
                      <h3>{p.name}</h3>
                      <p className="muted">{p.destination} · {p.duration}</p>
                      <div className="card-footer">
                        <Link to={`/packages/${p.id}`} className="btn btn-small">View</Link>
                        <button className="btn btn-outline" onClick={() => handleUnsave(p.id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div className="profile-box">
          <h3>Account Details</h3>
          {profileError && <p className="error-text">{profileError}</p>}
          {profileMessage && <p className="success-text">{profileMessage}</p>}
          <form onSubmit={handleProfileSubmit} className="auth-form">
            <label>Full Name
              <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
            </label>
            <label>Email
              <input value={user.email} disabled />
            </label>
            <label>Phone
              <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            </label>
            <button className="btn btn-primary" type="submit">Save Changes</button>
          </form>
        </div>
      )}

      {activeTab === "security" && (
        <div className="profile-box">
          <h3>Change Password</h3>
          {passwordError && <p className="error-text">{passwordError}</p>}
          {passwordMessage && <p className="success-text">{passwordMessage}</p>}
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            <label>Current Password
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            </label>
            <label>New Password
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
            </label>
            <button className="btn btn-primary" type="submit">Change Password</button>
          </form>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="profile-box">
          <h3>Preferences & Emergency Contact</h3>
          {prefsError && <p className="error-text">{prefsError}</p>}
          {prefsMessage && <p className="success-text">{prefsMessage}</p>}
          <form onSubmit={handlePrefsSubmit} className="auth-form">
            <label className="toggle-row">
              <span>Email me about booking updates &amp; trip news</span>
              <input
                type="checkbox"
                checked={prefsForm.emailNotifications}
                onChange={(e) => setPrefsForm({ ...prefsForm, emailNotifications: e.target.checked })}
              />
            </label>
            <label>Emergency Contact Name
              <input value={prefsForm.emergencyContactName} onChange={(e) => setPrefsForm({ ...prefsForm, emergencyContactName: e.target.value })} placeholder="Optional — used only in case of trip emergencies" />
            </label>
            <label>Emergency Contact Phone
              <input value={prefsForm.emergencyContactPhone} onChange={(e) => setPrefsForm({ ...prefsForm, emergencyContactPhone: e.target.value })} />
            </label>
            <button className="btn btn-primary" type="submit">Save Preferences</button>
          </form>
        </div>
      )}

      <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />
    </div>
  );
}
