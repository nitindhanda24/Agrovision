import { useEffect, useMemo, useState } from "react";
import { API, getErrorMessage } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getStoredValue, removeStoredValue } from "../utils/storage";

const mandiOptions = [
  "Pune APMC",
  "Hadapsar Mandi",
  "Pimpri Mandi",
  "Wagholi Mandi",
  "Chinchwad Mandi"
];

export default function TraderDashboard({ navigate, path }) {
  const userId = getStoredValue("userId");
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    cropName: "",
    cropType: "grains",
    price: "",
    quantity: "",
    deliveryMandi: "",
    note: "",
    imageUrl: ""
  });
  const [editingId, setEditingId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const requestRes = await API.get("/crop-requests");
      setRequests(requestRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load trader dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const myRequests = useMemo(
    () => requests.filter((request) => {
      const traderId = typeof request.traderId === "object" ? request.traderId?._id : request.traderId;
      return traderId === userId;
    }),
    [requests, userId]
  );

  const pendingOrders = myRequests.filter((order) => order.status === "pending").length;

  const resetForm = () => {
    setEditingId("");
    setForm({
      cropName: "",
      cropType: "grains",
      price: "",
      quantity: "",
      deliveryMandi: "",
      note: "",
      imageUrl: ""
    });
  };

  const onImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const body = new FormData();
      body.append("image", file);
      const res = await API.post("/crop-requests/upload-image", body, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload image"));
    } finally {
      setUploading(false);
    }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      setSubmitting(true);
      if (editingId) {
        await API.put(`/crop-requests/${editingId}`, form);
        setMessage("Request updated");
      } else {
        await API.post("/crop-requests", form);
        setMessage("Request sent to farmer");
      }
      resetForm();
      await loadDashboardData();
    } catch (err) {
      setError(getErrorMessage(err, "Could not submit request"));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (request) => {
    setEditingId(request._id);
    setForm({
      cropName: request.cropName,
      cropType: request.cropType || "grains",
      price: String(request.price || ""),
      quantity: String(request.quantity || ""),
      deliveryMandi: request.deliveryMandi || "",
      note: request.note || "",
      imageUrl: request.imageUrl || ""
    });
  };

  useEffect(() => {
    const editingRequestId = getStoredValue("traderEditingRequestId");
    if (!editingRequestId || myRequests.length === 0) return;

    const requestToEdit = myRequests.find((request) => request._id === editingRequestId);
    if (requestToEdit && requestToEdit.status === "pending") {
      startEdit(requestToEdit);
    }

    removeStoredValue("traderEditingRequestId");
  }, [myRequests]);

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />
      <div className="main">
        <Navbar navigate={navigate} />
        <main className="page">
          <div className="page-header">
            <h1>Trader Dashboard</h1>
          </div>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          {loading && <p className="muted">Loading dashboard data...</p>}

          <div className="panel">
            <h2>Market Snapshot</h2>
            <p>Manage buying requests and monitor product listings from a clean trader dashboard.</p>
          </div>

          <form className="panel" onSubmit={submitRequest}>
            <h3>{editingId ? "Edit Purchase Request" : "New Purchase Request"}</h3>
            <div className="form-grid">
              <input
                placeholder="Crop name"
                value={form.cropName}
                onChange={(e) => setForm((prev) => ({ ...prev, cropName: e.target.value }))}
                required
              />
              <select value={form.cropType} onChange={(e) => setForm((prev) => ({ ...prev, cropType: e.target.value }))}>
                <option value="grains">Grains</option>
                <option value="vegetables">Vegetables</option>
                <option value="oilseeds">Oilseeds</option>
                <option value="pulses">Pulses</option>
                <option value="spices">Spices</option>
                <option value="cash crops">Cash Crops</option>
                <option value="fruits">Fruits</option>
              </select>
              <input
                type="number"
                min="0"
                placeholder="Offer price"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Quantity (kg)"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                required
              />
              <select
                value={form.deliveryMandi}
                onChange={(e) => setForm((prev) => ({ ...prev, deliveryMandi: e.target.value }))}
                required
              >
                <option value="">Select delivery mandi</option>
                {mandiOptions.map((mandi) => (
                  <option key={mandi} value={mandi}>{mandi}</option>
                ))}
              </select>
              <input type="file" accept="image/*" onChange={onImageUpload} />
              <input
                placeholder="Or paste image URL"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              />
              <textarea
                placeholder="Notes for farmer"
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>
            <div className="row">
              <button type="submit" disabled={submitting || uploading}>
                {submitting ? "Saving..." : editingId ? "Update Request" : "Send Request"}
              </button>
              {editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel Edit</button>}
              {uploading && <span className="muted">Uploading image...</span>}
            </div>
          </form>

          <div className="grid">
            <div className="panel">
              <h3>My Requests</h3>
              <p className="stat">{myRequests.length}</p>
              <p className="muted">{pendingOrders} request(s) awaiting response. Full history is now available in Orders.</p>
            </div>
            <div className="panel">
              <h3>Editable Pending</h3>
              <p className="stat">{pendingOrders}</p>
              <p className="muted">Pending requests can be edited before acceptance.</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
