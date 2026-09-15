import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiCopy } from "react-icons/fi";
import { api } from "../../api";
import ConfirmDialog from "../../components/ConfirmDialog";

const BLANK_FORM = {
  name: "", destination: "", price: "", duration: "", seatsAvailable: "",
  shortDescription: "", datesText: "", imagesText: "", highlightsText: "",
  inclusionsText: "", exclusionsText: "", itineraryText: ""
};

function parseItineraryText(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line, i) => {
    const [title, description] = line.split("|").map((s) => s.trim());
    return { day: i + 1, title: title || `Day ${i + 1}`, description: description || "" };
  });
}

function itineraryToText(itinerary) {
  return (itinerary || []).map((step) => `${step.title} | ${step.description}`).join("\n");
}

function csvToText(arr) { return (arr || []).join(", "); }
function textToCsv(text) { return text.split(",").map((s) => s.trim()).filter(Boolean); }

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    api.admin.getPackages().then((data) => setPackages(data.packages)).catch(() => setError("Couldn't load packages."));
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm(BLANK_FORM);
    setEditingId(null);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(pkg) {
    setForm({
      name: pkg.name, destination: pkg.destination, price: pkg.price, duration: pkg.duration,
      seatsAvailable: pkg.seatsAvailable, shortDescription: pkg.shortDescription,
      datesText: csvToText(pkg.dates), imagesText: csvToText(pkg.images),
      highlightsText: csvToText(pkg.highlights), inclusionsText: csvToText(pkg.inclusions),
      exclusionsText: csvToText(pkg.exclusions), itineraryText: itineraryToText(pkg.itinerary)
    });
    setEditingId(pkg.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDuplicate(pkg) {
    setForm({
      name: pkg.name + " (Copy)", destination: pkg.destination, price: pkg.price, duration: pkg.duration,
      seatsAvailable: pkg.seatsAvailable, shortDescription: pkg.shortDescription,
      datesText: csvToText(pkg.dates), imagesText: csvToText(pkg.images),
      highlightsText: csvToText(pkg.highlights), inclusionsText: csvToText(pkg.inclusions),
      exclusionsText: csvToText(pkg.exclusions), itineraryText: itineraryToText(pkg.itinerary)
    });
    setEditingId(null);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      destination: form.destination,
      price: Number(form.price),
      duration: form.duration,
      seatsAvailable: Number(form.seatsAvailable),
      shortDescription: form.shortDescription,
      dates: textToCsv(form.datesText),
      images: textToCsv(form.imagesText),
      highlights: textToCsv(form.highlightsText),
      inclusions: textToCsv(form.inclusionsText),
      exclusions: textToCsv(form.exclusionsText),
      itinerary: parseItineraryText(form.itineraryText)
    };
    try {
      if (editingId) {
        await api.admin.updatePackage(editingId, payload);
      } else {
        await api.admin.createPackage(payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    try {
      await api.admin.deletePackage(deleteTarget);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Packages</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Package</button>
      </div>
      {error && <p className="error-text">{error}</p>}

      {formOpen && (
        <div className="admin-form-card">
          <h3>{editingId ? "Edit Package" : "New Package"}</h3>
          <form onSubmit={handleSubmit} className="auth-form admin-inline-form">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Destination<input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required /></label>
            <label>Price (₹)<input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label>
            <label>Duration<input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required placeholder="e.g. 4 Days / 3 Nights" /></label>
            <label>Seats Available<input type="number" value={form.seatsAvailable} onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })} required /></label>
            <label>Available Dates (comma-separated, YYYY-MM-DD)<input value={form.datesText} onChange={(e) => setForm({ ...form, datesText: e.target.value })} placeholder="2026-12-01, 2026-12-15" /></label>

            <label style={{ gridColumn: "1 / -1" }}>Short Description<input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></label>
            <label style={{ gridColumn: "1 / -1" }}>Image URLs (comma-separated)<input value={form.imagesText} onChange={(e) => setForm({ ...form, imagesText: e.target.value })} placeholder="https://..., https://..." /></label>
            <label style={{ gridColumn: "1 / -1" }}>Highlights (comma-separated)<input value={form.highlightsText} onChange={(e) => setForm({ ...form, highlightsText: e.target.value })} placeholder="Beach hopping, Sunset cruise, ..." /></label>
            <label>Inclusions (comma-separated)<input value={form.inclusionsText} onChange={(e) => setForm({ ...form, inclusionsText: e.target.value })} /></label>
            <label>Exclusions (comma-separated)<input value={form.exclusionsText} onChange={(e) => setForm({ ...form, exclusionsText: e.target.value })} /></label>
            <label style={{ gridColumn: "1 / -1" }}>
              Itinerary — one day per line, formatted as: Title | Description
              <textarea
                rows={4}
                value={form.itineraryText}
                onChange={(e) => setForm({ ...form, itineraryText: e.target.value })}
                placeholder={"Arrival & Check-in | Settle into the hotel, evening at leisure\nCity Sightseeing | Guided tour of the main attractions"}
              />
            </label>

            <div style={{ display: "flex", gap: "0.6rem", gridColumn: "1 / -1" }}>
              <button className="btn btn-primary" type="submit">{editingId ? "Save Changes" : "Create Package"}</button>
              <button className="btn btn-outline" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Destination</th><th>Price</th><th>Seats</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {packages.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.destination}</td>
              <td>₹{p.price.toLocaleString("en-IN")}</td>
              <td>{p.seatsAvailable}</td>
              <td className="table-actions">
                <button className="btn btn-small" onClick={() => openEdit(p)} title="Edit"><FiEdit2 /></button>
                <button className="btn btn-outline" onClick={() => openDuplicate(p)} title="Duplicate as new package"><FiCopy /></button>
                <button className="btn btn-danger" onClick={() => setDeleteTarget(p.id)} title="Delete"><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this package?"
        message="This removes it from the public site immediately. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
