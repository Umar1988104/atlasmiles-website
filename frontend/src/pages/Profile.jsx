import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function Profile() {
  const { user, updateUserInState } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    try {
      const data = await api.updateProfile(profileForm);
      updateUserInState(data.user);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(err.message);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    try {
      await api.changePassword(passwordForm);
      setPasswordMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.message);
    }
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

      <div className="profile-grid">
      <div className="profile-box">
        <h3>Account Details</h3>
        {profileError && <p className="error-text">{profileError}</p>}
        {profileMessage && <p className="success-text">{profileMessage}</p>}
        <form onSubmit={handleProfileSubmit} className="auth-form">
          <label>Full Name
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </label>
          <label>Phone
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
          </label>
          <button className="btn btn-primary" type="submit">Save Changes</button>
        </form>
      </div>

      <div className="profile-box">
        <h3>Change Password</h3>
        {passwordError && <p className="error-text">{passwordError}</p>}
        {passwordMessage && <p className="success-text">{passwordMessage}</p>}
        <form onSubmit={handlePasswordSubmit} className="auth-form">
          <label>Current Password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </label>
          <label>New Password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </label>
          <button className="btn btn-primary" type="submit">Change Password</button>
        </form>
      </div>
      </div>
    </div>
  );
}
