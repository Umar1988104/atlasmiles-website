import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { api } from "../api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function load() {
    api.getNotifications().then((data) => setNotifications(data.notifications)).catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleOpen() {
    setOpen(!open);
    if (!open && notifications.some(n => !n.read)) {
      await api.markAllNotificationsRead();
      load();
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-bell" onClick={handleOpen} aria-label="Notifications">
        <FiBell />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <p className="muted" style={{ padding: "1rem" }}>No notifications yet.</p>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <div className={`notif-item ${n.read ? "" : "unread"}`} key={n.id}>
                <p>{n.message}</p>
                <span className="muted">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
