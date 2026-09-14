import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevLink("");
    setLoading(true);
    try {
      const data = await api.forgotPassword({ email });
      setMessage(data.message);
      if (data.devOnlyResetLink) setDevLink(data.devOnlyResetLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section narrow auth-form">
      <h1>Forgot Password</h1>
      <p className="muted">Enter your account email and we'll help you reset your password.</p>
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      {devLink && (
        <div className="dev-note">
          <strong>Development mode note:</strong> Email sending isn't set up yet, so here's
          your reset link for testing. In production this would be sent to your inbox instead.
          <br />
          <Link to={devLink}>{window.location.origin}{devLink}</Link>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p><Link to="/login">Back to Login</Link></p>
    </div>
  );
}
