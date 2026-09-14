import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDestinations()
      .then((data) => setDestinations(data.destinations))
      .catch(() => setError("Couldn't load destinations right now."));
  }, []);

  return (
    <div className="section">
      <h1>Destinations</h1>
      {error && <p className="error-text">{error}</p>}
      <div className="card-grid">
        {destinations.map((d) => (
          <div className="card" key={d.name}>
            <div className="card-image-wrap">
              <img src={d.image} alt={d.name} />
            </div>
            <div className="card-body">
              <h3>{d.name}</h3>
              <p className="muted">{d.packageCount} package{d.packageCount > 1 ? "s" : ""} available</p>
              <Link to="/packages" className="btn btn-small">View Packages</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
