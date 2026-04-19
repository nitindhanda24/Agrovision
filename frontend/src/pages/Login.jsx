import { useState } from "react";
import { API, getErrorMessage } from "../api/api";
import { getStoredValue, setStoredValue } from "../utils/storage";

const roleDashboardPath = {
  farmer: "/farmer-dashboard",
  trader: "/trader-dashboard"
};

export default function Login({ navigate }) {
  const savedRole = getStoredValue("authRoleIntent");
  const [role, setRole] = useState(savedRole === "trader" ? "trader" : "farmer");
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const res = await API.post("/auth/login", data);
      if (res.data.role !== role) {
        setError(`This account is ${res.data.role}. Please choose ${res.data.role} login.`);
        return;
      }
      setStoredValue("token", res.data.token);
      setStoredValue("userId", res.data.id);
      setStoredValue("role", res.data.role);
      setStoredValue("name", res.data.name);
      navigate(roleDashboardPath[res.data.role] || "/login");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <h2>Login</h2>
      <p className="muted">Choose role and continue to your dedicated dashboard.</p>
      <form className="panel" onSubmit={login}>
        <div className="auth-role-switch">
          <button type="button" className={role === "farmer" ? "" : "secondary"} onClick={() => setRole("farmer")}>Farmer</button>
          <button type="button" className={role === "trader" ? "" : "secondary"} onClick={() => setRole("trader")}>Trader</button>
        </div>
        {error && <p className="error">{error}</p>}
        <input placeholder="Email" value={data.email} onChange={e => setData({...data,email:e.target.value})}/>
        <input type="password" placeholder="Password" value={data.password} onChange={e => setData({...data,password:e.target.value})}/>
        <button type="submit" disabled={submitting}>{submitting ? `Logging in as ${role}...` : `Login as ${role}`}</button>
        <p className="muted">New user? <button type="button" className="link-btn" onClick={() => { setStoredValue("authRoleIntent", role); navigate("/register"); }}>Create {role} account</button></p>
      </form>
    </main>
  );
}
