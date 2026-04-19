import { useEffect, useMemo, useState } from "react";
import { API, getErrorMessage, resolveImageUrl } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getStoredValue, setStoredValue } from "../utils/storage";

export default function Orders({ navigate, path }) {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "all", q: "" });
  const [appliedFilters, setAppliedFilters] = useState({ status: "all", q: "" });
  const role = getStoredValue("role");
  const userId = getStoredValue("userId");

  const loadOrders = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await API.get("/orders", { params: appliedFilters });
      setOrders(res.data);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not load orders"));
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (role !== "trader" && role !== "farmer") return;

    setRequestLoading(true);
    try {
      const res = await API.get("/crop-requests");
      setRequests(res.data || []);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not load purchase requests"));
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [appliedFilters]);

  useEffect(() => {
    loadRequests();
  }, [role]);

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const farmerId = typeof order.farmerId === "object" ? order.farmerId?._id : order.farmerId;
      const traderId = typeof order.traderId === "object" ? order.traderId?._id : order.traderId;

      if (role === "admin") return true;
      if (role === "farmer") return farmerId === userId;
      if (role === "trader") return traderId === userId;
      return false;
    });
  }, [orders, role, userId]);

  const visibleRequests = useMemo(() => {
    if (role !== "trader" && role !== "farmer") return [];

    const searchTerm = appliedFilters.q.trim().toLowerCase();

    return requests.filter((request) => {
      const traderId = typeof request.traderId === "object" ? request.traderId?._id : request.traderId;
      const farmerId = typeof request.farmerId === "object" ? request.farmerId?._id : request.farmerId;

      if (role === "trader" && traderId !== userId) return false;
      if (role === "farmer" && farmerId && farmerId !== userId) return false;

      const normalizedStatus = request.status === "approved"
        ? "accepted"
        : request.status === "rejected"
          ? "declined"
          : request.status;

      if (appliedFilters.status !== "all" && normalizedStatus !== appliedFilters.status) {
        return false;
      }

      if (!searchTerm) return true;

      const cropName = (request.cropName || "").toLowerCase();
      const cropType = (request.cropType || "").toLowerCase();
      const traderName = (request.traderId?.name || "").toLowerCase();
      const farmerName = (request.farmerId?.name || "").toLowerCase();
      const note = (request.note || "").toLowerCase();
      const deliveryMandi = (request.deliveryMandi || "").toLowerCase();

      return (
        cropName.includes(searchTerm) ||
        cropType.includes(searchTerm) ||
        traderName.includes(searchTerm) ||
        farmerName.includes(searchTerm) ||
        note.includes(searchTerm) ||
        deliveryMandi.includes(searchTerm)
      );
    });
  }, [requests, role, userId, appliedFilters]);

  const counters = useMemo(() => {
    const initial = { pending: 0, accepted: 0, completed: 0, declined: 0 };
    visibleOrders.forEach((order) => {
      const normalized = order.status === "approved"
        ? "accepted"
        : order.status === "rejected"
          ? "declined"
          : order.status;
      if (initial[normalized] !== undefined) initial[normalized] += 1;
    });
    return initial;
  }, [visibleOrders]);

  const requestCounters = useMemo(() => {
    const initial = { pending: 0, accepted: 0, completed: 0, declined: 0 };

    visibleRequests.forEach((request) => {
      const normalized = request.status === "approved"
        ? "accepted"
        : request.status === "rejected"
          ? "declined"
          : request.status;
      if (initial[normalized] !== undefined) initial[normalized] += 1;
    });

    return initial;
  }, [visibleRequests]);

  const openRequestEditor = (requestId) => {
    setStoredValue("traderEditingRequestId", requestId);
    navigate("/trader-dashboard");
  };

  const applyFilters = () => {
    setAppliedFilters({
      status: filters.status,
      q: filters.q.trim()
    });
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}`, { status });
      setMessage("Order updated successfully");
      await loadOrders();
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not update order"));
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await API.put(`/crop-requests/${id}`, { status });
      setMessage("Request updated successfully");
      await loadRequests();
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not update request"));
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
              <h2>Orders</h2>
              <p className="muted">Track and manage crop requests across Pune mandis.</p>
            </div>
          </div>
          <div className="panel filter-panel">
            <div className="field-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div className="field-group grow">
              <label htmlFor="order-search">Search Crop</label>
              <input
                id="order-search"
                placeholder="Search by crop name..."
                value={filters.q}
                onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              />
            </div>
            <button type="button" onClick={applyFilters}>Apply Filters</button>
          </div>
          {message && <p className={message.includes("updated") ? "success" : "error"}>{message}</p>}
          {role !== "trader" && role !== "farmer" && (
            <>
              <div className="stats-grid">
                <div className="panel stat-panel"><p className="muted">Pending</p><p className="stat">{counters.pending}</p></div>
                <div className="panel stat-panel"><p className="muted">Accepted</p><p className="stat">{counters.accepted}</p></div>
                <div className="panel stat-panel"><p className="muted">Completed</p><p className="stat">{counters.completed}</p></div>
                <div className="panel stat-panel"><p className="muted">Declined</p><p className="stat">{counters.declined}</p></div>
              </div>

              {!role ? (
                <div className="panel">Login to view your orders.</div>
              ) : loading ? (
                <div className="panel muted">Loading orders...</div>
              ) : visibleOrders.length === 0 ? (
                <div className="panel">No orders yet.</div>
              ) : (
                <div className="panel">
                  {visibleOrders.map(o => (
                    <div key={o._id} className="order order-row">
                      <div>
                        <p><strong>{typeof o.productId === "object" ? o.productId?.name : o.productId}</strong></p>
                        <p className="muted">{typeof o.productId === "object" ? o.productId?.mandi : "Mandi unavailable"}</p>
                        {o.deliveryMandi && (
                          <p className="muted">Delivery: {o.deliveryMandi}</p>
                        )}
                      </div>
                      <span className={`tag ${o.status}`}>{o.status}</span>

                      {role === "farmer" && o.status === "pending" && (
                        <div className="row">
                          <button onClick={() => updateStatus(o._id, "accepted")}>Accept</button>
                          <button className="danger" onClick={() => updateStatus(o._id, "declined")}>Decline</button>
                          <button className="secondary" onClick={() => updateStatus(o._id, "completed")}>Complete</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {(role === "trader" || role === "farmer") && (
            <div className="panel">
              <div className="section-heading">
                <div>
                  <h3>{role === "trader" ? "Purchase Request History" : "Trader Purchase Requests"}</h3>
                  <p className="muted">
                    {role === "trader"
                      ? "Recent purchase requests are tracked here so you can review all previous trader activity in one place."
                      : "Review and manage incoming trader purchase requests here instead of from the dashboard."}
                  </p>
                </div>
                {role === "trader" && (
                  <button type="button" className="secondary" onClick={() => navigate("/trader-dashboard")}>
                    New Request
                  </button>
                )}
              </div>

              <div className="stats-grid compact-stats">
                <div className="panel stat-panel"><p className="muted">Pending Requests</p><p className="stat">{requestCounters.pending}</p></div>
                <div className="panel stat-panel"><p className="muted">{role === "farmer" ? "Accepted" : "Accepted Requests"}</p><p className="stat">{requestCounters.accepted}</p></div>
                <div className="panel stat-panel"><p className="muted">Completed Requests</p><p className="stat">{requestCounters.completed}</p></div>
                <div className="panel stat-panel"><p className="muted">{role === "farmer" ? "Rejected" : "Declined Requests"}</p><p className="stat">{requestCounters.declined}</p></div>
              </div>

              {requestLoading ? (
                <p className="muted">Loading purchase requests...</p>
              ) : visibleRequests.length === 0 ? (
                <p className="muted">{role === "trader" ? "No purchase requests yet." : "No trader purchase requests yet."}</p>
              ) : (
                <div className="request-grid">
                  {visibleRequests.map((request) => (
                    <div key={request._id} className="order order-card">
                      {request.imageUrl && (
                        <img
                          className="preview-image"
                          src={resolveImageUrl(request.imageUrl)}
                          alt={request.cropName}
                        />
                      )}
                      <div className="order-card-header">
                        <div>
                          <p><strong>{request.cropName}</strong> ({request.cropType})</p>
                          <p className="muted">
                            {role === "trader"
                              ? `Farmer: ${request.farmerId?.name || "Open for farmers"}`
                              : `Trader: ${request.traderId?.name || "Unknown"}${request.traderId?.email ? ` (${request.traderId.email})` : ""}`}
                          </p>
                        </div>
                        <span className={`tag ${request.status}`}>{request.status}</span>
                      </div>
                      <p className="muted">Price: Rs {request.price} | Qty: {request.quantity} kg</p>
                      {request.deliveryMandi && <p className="muted">Delivery Mandi: {request.deliveryMandi}</p>}
                      {request.note && <p>{request.note}</p>}
                      {request.status === "pending" && (
                        <div className="row">
                          {role === "trader" ? (
                            <button type="button" className="secondary" onClick={() => openRequestEditor(request._id)}>
                              Edit Request
                            </button>
                          ) : (
                            <>
                              <button type="button" onClick={() => updateRequestStatus(request._id, "accepted")}>
                                Accept
                              </button>
                              <button type="button" className="danger" onClick={() => updateRequestStatus(request._id, "rejected")}>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
