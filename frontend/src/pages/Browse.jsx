import { useEffect, useState } from "react";
import { API, getErrorMessage } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProductCard from "../components/ProductCard";

export default function Browse({ navigate, path }) {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedMandi, setSelectedMandi] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    mandi: "all",
    cropType: "all"
  });
  const role = localStorage.getItem("role");

  const loadProducts = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await API.get("/products", { params: filters });
      setData(res.data);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const requestOrder = (product) => {
    const traderId = localStorage.getItem("userId");

    if (!traderId) {
      navigate("/login");
      return;
    }

    setSelectedProduct(product);
    setSelectedMandi("");
    setShowOrderModal(true);
  };

  const submitOrder = async () => {
    if (!selectedMandi) {
      setMessage("Please select a mandi for delivery");
      return;
    }

    const traderId = localStorage.getItem("userId");

    try {
      setSubmittingOrder(true);
      await API.post("/orders", {
        productId: selectedProduct._id,
        farmerId: typeof selectedProduct.farmerId === "object" ? selectedProduct.farmerId?._id : selectedProduct.farmerId,
        traderId,
        deliveryMandi: selectedMandi
      });
      setMessage("Order request sent successfully");
      setShowOrderModal(false);
      setSelectedProduct(null);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not request order"));
    } finally {
      setSubmittingOrder(false);
    }
  };

  const seedDemoListings = async () => {
    try {
      setSeeding(true);
      const res = await API.post("/products/seed-demo");
      setMessage(res.data?.message || "Demo crops added");
      await loadProducts();
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not add demo crops"));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />
      <div className="main">
        <Navbar navigate={navigate} />
        <main className="page">
          <div className="page-header">
            <div>
              <h2>Crop Listings</h2>
              <p className="muted">Manage and browse crop listings across Pune mandis.</p>
            </div>
            <div className="row">
              <button type="button" className="secondary" onClick={seedDemoListings} disabled={seeding}>
                {seeding ? "Adding Demo..." : "+ Add 15 Demo Crops"}
              </button>
              <button type="button" onClick={() => navigate("/add")}>+ Add New Listing</button>
            </div>
          </div>
          <div className="panel filter-panel">
            <div className="field-group grow">
              <label htmlFor="search-crop">Search Crops</label>
              <input
                id="search-crop"
                placeholder="Search by crop name..."
                value={filters.q}
                onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="mandi-filter">Mandi</label>
              <select
                id="mandi-filter"
                value={filters.mandi}
                onChange={(event) => setFilters((prev) => ({ ...prev, mandi: event.target.value }))}
              >
                <option value="all">All Mandis</option>
                <option value="Pune APMC">Pune APMC</option>
                <option value="Hadapsar Mandi">Hadapsar Mandi</option>
                <option value="Pimpri Mandi">Pimpri Mandi</option>
                <option value="Wagholi Mandi">Wagholi Mandi</option>
                <option value="Chinchwad Mandi">Chinchwad Mandi</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="crop-filter">Crop Type</label>
              <select
                id="crop-filter"
                value={filters.cropType}
                onChange={(event) => setFilters((prev) => ({ ...prev, cropType: event.target.value }))}
              >
                <option value="all">All Types</option>
                <option value="grains">Grains</option>
                <option value="vegetables">Vegetables</option>
                <option value="oilseeds">Oilseeds</option>
                <option value="pulses">Pulses</option>
                <option value="spices">Spices</option>
                <option value="cash crops">Cash Crops</option>
                <option value="fruits">Fruits</option>
              </select>
            </div>
            <button type="button" onClick={loadProducts}>Search</button>
          </div>
          {message && <p className={/sent|added/i.test(message) ? "success" : "error"}>{message}</p>}
          {loading ? (
            <div className="panel muted">Loading crops...</div>
          ) : data.length === 0 ? (
            <div className="panel">No crops listed yet.</div>
          ) : (
            <div className="grid">
              {data.map(p => (
                <ProductCard key={p._id} p={p} order={requestOrder} canOrder={role === "trader"} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Order Request Modal */}
      {showOrderModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Request Order</h3>
            <div className="product-preview">
              <img src={selectedProduct.imageUrl || "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1000&q=60"} alt={selectedProduct.name} />
              <div>
                <h4>{selectedProduct.name}</h4>
                <p className="muted">{selectedProduct.cropType || "grains"}</p>
                <p className="value">Rs {selectedProduct.price} • {selectedProduct.quantity} Kg</p>
                <p className="muted">Farmer: {selectedProduct.farmerId?.name || "Unknown"}</p>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="delivery-mandi">Select Delivery Mandi</label>
              <select
                id="delivery-mandi"
                value={selectedMandi}
                onChange={(e) => setSelectedMandi(e.target.value)}
                required
              >
                <option value="">Choose a mandi...</option>
                <option value="Pune APMC">Pune APMC</option>
                <option value="Hadapsar Mandi">Hadapsar Mandi</option>
                <option value="Pimpri Mandi">Pimpri Mandi</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setShowOrderModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOrder}
                disabled={submittingOrder || !selectedMandi}
              >
                {submittingOrder ? "Sending Request..." : "Send Order Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
