import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [loginAs, setLoginAs] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password, loginAs);
      if (loggedInUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate(location.state?.redirectTo || "/profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section narrow">
      <div className="auth-card auth-form">
        <h1>Log In</h1>

        <div className="role-toggle">
          <button
            type="button"
            className={loginAs === "user" ? "active" : ""}
            onClick={() => setLoginAs("user")}
          >
            <FiUser /> Traveller
          </button>
          <button
            type="button"
            className={loginAs === "admin" ? "active" : ""}
            onClick={() => setLoginAs("admin")}
          >
            <FiShield /> Admin
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Logging in..." : `Log In as ${loginAs === "admin" ? "Admin" : "Traveller"}`}
          </button>
        </form>
        <p><Link to="/forgot-password">Forgot your password?</Link></p>
        <p>New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
