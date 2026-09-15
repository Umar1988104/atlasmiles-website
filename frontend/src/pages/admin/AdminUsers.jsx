import { useEffect, useState } from "react";
import { api } from "../../api";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [toggleTarget, setToggleTarget] = useState(null);

  function load() {
    api.admin.getUsers().then((data) => setUsers(data.users)).catch(() => setError("Couldn't load users."));
  }
  useEffect(() => { load(); }, []);

  async function handleToggleConfirmed() {
    try {
      await api.admin.toggleUserDisabled(toggleTarget.id);
      setToggleTarget(null);
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <h1 className="admin-page-title">Users</h1>
      {error && <p className="error-text">{error}</p>}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone || "—"}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td><span className={`status-pill ${u.disabled ? "status-cancelled" : "status-confirmed"}`}>{u.disabled ? "Disabled" : "Active"}</span></td>
              <td>
                <button className={u.disabled ? "btn btn-small" : "btn btn-danger"} onClick={() => setToggleTarget(u)}>
                  {u.disabled ? "Enable" : "Disable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.disabled ? "Re-enable this account?" : "Disable this account?"}
        message={toggleTarget?.disabled ? "They'll be able to log in again." : "They won't be able to log in until re-enabled."}
        confirmLabel={toggleTarget?.disabled ? "Enable" : "Disable"}
        danger={!toggleTarget?.disabled}
        onConfirm={handleToggleConfirmed}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
