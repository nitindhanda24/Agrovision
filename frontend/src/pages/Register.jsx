import { useState } from "react";
import { API, getErrorMessage } from "../api/api";
import { getStoredValue, setStoredValue } from "../utils/storage";

export default function Register({ navigate }) {
  const initialRole = getStoredValue("authRoleIntent") === "trader" ? "trader" : "farmer";
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const register = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      await API.post("/auth/register", data);
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <h2>Register</h2>
      <p className="muted">Pick your role to create the correct dashboard account.</p>
      <form className="panel" onSubmit={register}>
        <div className="auth-role-switch">
          <button type="button" className={data.role === "farmer" ? "" : "secondary"} onClick={() => setData({...data, role: "farmer"})}>Farmer</button>
          <button type="button" className={data.role === "trader" ? "" : "secondary"} onClick={() => setData({...data, role: "trader"})}>Trader</button>
        </div>
        {error && <p className="error">{error}</p>}
        <input placeholder="Name" value={data.name} onChange={e => setData({...data,name:e.target.value})}/>
        <input placeholder="Email" value={data.email} onChange={e => setData({...data,email:e.target.value})}/>
        <input type="password" placeholder="Password" value={data.password} onChange={e => setData({...data,password:e.target.value})}/>
        <button type="submit" disabled={submitting}>{submitting ? `Creating ${data.role} account...` : `Register as ${data.role}`}</button>
        <p className="muted">Already registered? <button type="button" className="link-btn" onClick={() => { setStoredValue("authRoleIntent", data.role); navigate("/login"); }}>Login as {data.role}</button></p>
      </form>
    </main>
  );
}
