import { useEffect, useState } from "react";
import { API, getErrorMessage } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { setStoredValue } from "../utils/storage";

export default function EditProfile({ navigate, path }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/auth/profile");
      setForm({ name: res.data?.name || "", email: res.data?.email || "", password: "" });
    } catch (err) {
      setError(getErrorMessage(err, "Could not load profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      setSaving(true);
      const payload = { name: form.name, email: form.email };
      if (form.password.trim()) payload.password = form.password;
      const res = await API.put("/auth/profile", payload);
      setStoredValue("name", res.data.name);
      setForm((prev) => ({ ...prev, password: "" }));
      setMessage("Profile updated");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />
      <div className="main">
        <Navbar navigate={navigate} />
        <main className="page">
          <div className="page-header">
            <h1>Edit Profile</h1>
            <button type="button" className="secondary" onClick={loadProfile}>Refresh</button>
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          {loading && <p className="muted">Loading profile...</p>}

          <form className="panel" onSubmit={saveProfile}>
            <div className="form-grid">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="New password (optional)"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
