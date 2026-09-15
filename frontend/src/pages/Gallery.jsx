import { useEffect, useState } from "react";
import { api } from "../api";

export default function Gallery() {
  const [albums, setAlbums] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    api.getGallery().then((data) => setAlbums(data.albums)).catch(() => setError("Couldn't load the gallery right now."));
  }, []);

  return (
    <div className="section">
      <h1>Gallery</h1>
      {error && <p className="error-text">{error}</p>}
      {Object.entries(albums).map(([album, images]) => (
        <div key={album} style={{ marginBottom: "2.5rem" }}>
          <div className="section-heading"><h2>{album}</h2></div>
          <div className="card-grid">
            {images.map((img) => (
              <div className="card" key={img.id}>
                <div className="card-image-wrap"><img src={img.url} alt={img.caption} /></div>
                {img.caption && <div className="card-body"><p className="muted">{img.caption}</p></div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
