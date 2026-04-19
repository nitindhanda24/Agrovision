import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

export default function Dashboard({ navigate, path }) {
  const [message, setMessage] = useState("");

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />

      <div className="main">
        <Navbar navigate={navigate} />

        <main className="page">
          <div className="page-header">
            <h1>Farmer Dashboard</h1>
            <button type="button" className="secondary" onClick={() => navigate("/orders")}>
              View Orders
            </button>
          </div>

          {message && <p className="success">{message}</p>}

          <div className="panel">
            <h2>Farm Operations</h2>
            <p>Manage crop activity from one place and review trader purchase requests from the Orders section.</p>
          </div>

          <div className="grid">
            <div className="panel">
              <h3>Orders Section</h3>
              <p className="stat">1</p>
              <p className="muted">Trader purchase requests have been moved to Orders for easier tracking.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
