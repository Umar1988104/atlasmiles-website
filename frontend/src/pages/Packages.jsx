import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { api } from "../api";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPackages()
      .then((data) => setPackages(data.packages))
      .catch(() => setError("Couldn't load packages right now."));
  }, []);

  return (
    <div className="section">
      <h1>Travel Packages</h1>
      {error && <p className="error-text">{error}</p>}
      <div className="card-grid">
        {packages.map((p, idx) => (
          <div className="card" key={p.id}>
            <div className="card-image-wrap">
              <img src={p.image} alt={p.name} />
              {idx === 0 && <span className="card-badge">Bestseller</span>}
            </div>
            <div className="card-body">
              <h3>{p.name}</h3>
              <p className="muted">{p.destination} · {p.duration}</p>
              <p className="card-rating"><FiStar /> 4.{7 - (idx % 3)} <span className="count">(120+ reviews)</span></p>
              <p>{p.shortDescription}</p>
              <div className="card-footer">
                <span className="price">₹{p.price.toLocaleString("en-IN")}</span>
                <Link to={`/packages/${p.id}`} className="btn btn-small">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
