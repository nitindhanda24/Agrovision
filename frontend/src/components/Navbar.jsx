import { clearStoredSession, getStoredValue } from "../utils/storage";

export default function Navbar({ navigate }) {
  const name = getStoredValue("name");
  const role = getStoredValue("role");

  const logout = () => {
    clearStoredSession();
    if (navigate) navigate("/login");
    else window.location.href = "/login";
  };

  return (
    <header className="navbar">
      <div className="navbar-copy">
        <span className="navbar-kicker">AgroVision Workspace</span>
        <strong>Smart Crop Price Information System</strong>
        <p className="muted">Track listings, deals, and market activity in real-time.</p>
      </div>
      <div className="row navbar-actions">
        {name && <span className="navbar-user">{name} ({role})</span>}
        {role ? (
          <button className="secondary" onClick={logout}>Logout</button>
        ) : (
          <>
            <button type="button" className="link-btn" onClick={() => navigate("/login")}>Login</button>
            <button type="button" className="link-btn" onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </header>
  );
}
