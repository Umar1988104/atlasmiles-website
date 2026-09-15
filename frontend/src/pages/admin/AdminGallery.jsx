import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import { api } from "../../api";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ album: "", url: "", caption: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    api.admin.getGallery().then((data) => setImages(data.images)).catch(() => setError("Couldn't load gallery."));
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.admin.addGalleryImage(form);
      setForm({ album: "", url: "", caption: "" });
      setFormOpen(false);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleTogglePublished(id) {
    try {
      await api.admin.toggleGalleryPublished(id);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete() {
    try {
      await api.admin.deleteGalleryImage(deleteTarget);
      setDeleteTarget(null);
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Gallery</h1>
        <button className="btn btn-primary" onClick={() => setFormOpen(!formOpen)}><FiPlus /> Add Image</button>
      </div>
      {error && <p className="error-text">{error}</p>}

      {formOpen && (
        <div className="admin-form-card">
          <h3>New Image</h3>
          <p className="dev-note">Image upload isn't wired up yet — paste any image URL for now. Real file uploads (Supabase/Cloudinary storage) arrive in a later version.</p>
          <form onSubmit={handleSubmit} className="auth-form admin-inline-form">
            <label>Album<input value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} required placeholder="e.g. Customer Trips" /></label>
            <label>Image URL<input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required /></label>
            <label>Caption (optional)<input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} /></label>
            <button className="btn btn-primary" type="submit">Add Image</button>
          </form>
        </div>
      )}

      <div className="card-grid">
        {images.map((img) => (
          <div className="card" key={img.id}>
            <div className="card-image-wrap"><img src={img.url} alt={img.caption} /></div>
            <div className="card-body">
              <p className="muted">{img.album}</p>
              {img.caption && <p>{img.caption}</p>}
              <div className="card-footer">
                <button className="btn btn-small" onClick={() => handleTogglePublished(img.id)}>
                  {img.published ? <><FiEyeOff /> Unpublish</> : <><FiEye /> Publish</>}
                </button>
                <button className="btn btn-danger" onClick={() => setDeleteTarget(img.id)}><FiTrash2 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this image?"
        message="This removes it from the gallery permanently."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
