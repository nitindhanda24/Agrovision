import { useEffect, useMemo, useState } from "react";
import { API, getErrorMessage } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard({ navigate, path }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, ordersRes, chatRes] = await Promise.all([
        API.get("/products"),
        API.get("/orders"),
        API.get("/chat")
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setMessages(chatRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load admin dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const orderStats = useMemo(() => {
    const stats = { pending: 0, accepted: 0, completed: 0, declined: 0 };
    orders.forEach((order) => {
      const key = order.status === "approved"
        ? "accepted"
        : order.status === "rejected"
          ? "declined"
          : order.status;
      if (stats[key] !== undefined) stats[key] += 1;
    });
    return stats;
  }, [orders]);

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />
      <div className="main">
        <Navbar navigate={navigate} />
        <main className="page">
          <div className="page-header">
            <h1>Admin Dashboard</h1>
            <button type="button" className="secondary" onClick={loadDashboardData}>Refresh</button>
          </div>
          {error && <p className="error">{error}</p>}
          {loading && <p className="muted">Loading dashboard data...</p>}
          <div className="panel">
            <h2>Marketplace Overview</h2>
            <p>Review platform-wide listing flow, order status distribution, and communication activity.</p>
          </div>
          <div className="stats-grid">
            <div className="panel stat-panel"><p className="muted">Total Crops</p><p className="stat">{products.length}</p></div>
            <div className="panel stat-panel"><p className="muted">Pending Orders</p><p className="stat">{orderStats.pending}</p></div>
            <div className="panel stat-panel"><p className="muted">Completed Orders</p><p className="stat">{orderStats.completed}</p></div>
            <div className="panel stat-panel"><p className="muted">Messages</p><p className="stat">{messages.length}</p></div>
          </div>
          <div className="grid">
            <div className="panel">
              <h3>Accepted Orders</h3>
              <p className="stat">{orderStats.accepted}</p>
            </div>
            <div className="panel">
              <h3>Declined Orders</h3>
              <p className="stat">{orderStats.declined}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
