import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiStar, FiHeart } from "react-icons/fi";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get("search") || "").toLowerCase();
  const { user, updateUserInState } = useAuth();

  useEffect(() => {
    api
      .getPackages()
      .then((data) => setPackages(data.packages))
      .catch(() => setError("Couldn't load packages right now."));
  }, []);

  const filtered = searchTerm
    ? packages.filter((p) => p.name.toLowerCase().includes(searchTerm) || p.destination.toLowerCase().includes(searchTerm))
    : packages;

  async function handleToggleSave(e, packageId) {
    e.preventDefault();
    if (!user) return;
    const data = await api.toggleSavedPackage(packageId);
    updateUserInState({ ...user, savedPackages: data.savedPackages });
  }

  return (
    <div className="section">
      <h1>Travel Packages</h1>
      {searchTerm && <p className="muted">Showing results for "{searchTerm}"</p>}
      {error && <p className="error-text">{error}</p>}
      {filtered.length === 0 && !error && <p className="muted">No packages match your search.</p>}
      <div className="card-grid">
        {filtered.map((p, idx) => {
          const isSaved = user?.savedPackages?.includes(p.id);
          return (
            <Link to={`/packages/${p.id}`} className="card" key={p.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card-image-wrap">
                <img src={p.image} alt={p.name} />
                {idx === 0 && <span className="card-badge">Bestseller</span>}
                {user && (
                  <button
                    className="wishlist-btn"
                    onClick={(e) => handleToggleSave(e, p.id)}
                    aria-label="Save for later"
                  >
                    <FiHeart style={{ fill: isSaved ? "var(--coral)" : "none" }} />
                  </button>
                )}
              </div>
              <div className="card-body">
                <h3>{p.name}</h3>
                <p className="muted">{p.destination} · {p.duration}</p>
                <p className="card-rating"><FiStar /> 4.{7 - (idx % 3)} <span className="count">(120+ reviews)</span></p>
                <p>{p.shortDescription}</p>
                <div className="card-footer">
                  <span className="price">₹{p.price.toLocaleString("en-IN")}</span>
                  <span className="btn btn-small">View Details</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
