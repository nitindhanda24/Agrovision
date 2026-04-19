import { useState } from "react";
import { API, getErrorMessage } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getStoredValue } from "../utils/storage";

export default function AddProduct({ navigate, path }) {
  const [data, setData] = useState({
    name: "",
    cropType: "grains",
    price: "",
    quantity: "",
    mandi: "Pune APMC",
    health: "healthy",
    status: "approved",
    imageUrl: ""
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!data.name.trim()) {
      setMessage("Please enter crop name");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/products", {
        ...data,
        farmerId: getStoredValue("userId")
      });
      setData({
        name: "",
        cropType: "grains",
        price: "",
        quantity: "",
        mandi: "Pune APMC",
        health: "healthy",
        status: "approved",
        imageUrl: ""
      });
      setMessage("Crop added successfully");
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not add crop"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />
      <div className="main">
        <Navbar navigate={navigate} />
        <main className="page">
          <h2>Add New Crop Listing</h2>
          <p className="muted">Create marketplace-ready crop cards with status and health indicators.</p>
          {getStoredValue("role") !== "farmer" ? (
            <div className="panel">Only farmers can add crops.</div>
          ) : (
            <form className="panel" onSubmit={submit}>
              {message && <p className={message.includes("successfully") ? "success" : "error"}>{message}</p>}
              <input placeholder="Name" value={data.name} onChange={e => setData({...data,name:e.target.value})}/>
              <select value={data.cropType} onChange={e => setData({...data,cropType:e.target.value})}>
                <option value="grains">Grains</option>
                <option value="vegetables">Vegetables</option>
                <option value="oilseeds">Oilseeds</option>
                <option value="pulses">Pulses</option>
                <option value="spices">Spices</option>
                <option value="cash crops">Cash Crops</option>
                <option value="fruits">Fruits</option>
              </select>
              <input type="number" min="0" placeholder="Price" value={data.price} onChange={e => setData({...data,price:e.target.value})}/>
              <input type="number" min="0" placeholder="Quantity" value={data.quantity} onChange={e => setData({...data,quantity:e.target.value})}/>
              <select value={data.mandi} onChange={e => setData({...data,mandi:e.target.value})}>
                <option>Pune APMC</option>
                <option>Hadapsar Mandi</option>
                <option>Pimpri Mandi</option>
                <option>Wagholi Mandi</option>
                <option>Chinchwad Mandi</option>
              </select>
              <div className="row">
                <select value={data.health} onChange={e => setData({...data,health:e.target.value})}>
                  <option value="healthy">Healthy</option>
                  <option value="stable">Stable</option>
                  <option value="monitor">Monitor</option>
                </select>
                <select value={data.status} onChange={e => setData({...data,status:e.target.value})}>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <input placeholder="Image URL (optional)" value={data.imageUrl} onChange={e => setData({...data,imageUrl:e.target.value})}/>
              <button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add"}</button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
