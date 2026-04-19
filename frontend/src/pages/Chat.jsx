import { useEffect, useState } from "react";
import { API, getErrorMessage } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Chat({ navigate, path }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const loadChat = async () => {
    try {
      const res = await API.get("/chat");
      setChat(res.data);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not load chat"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
    const timer = window.setInterval(loadChat, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const send = async (event) => {
    event.preventDefault();

    if (!userId) {
      navigate("/login");
      return;
    }

    if (!msg.trim()) return;

    try {
      await API.post("/chat", {
        sender: userId,
        receiver: "all",
        message: msg
      });
      setMsg("");
      setMessage("");
      loadChat();
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not send message"));
    }
  };

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />
      <div className="main">
        <Navbar navigate={navigate} />
        <main className="page">
          <div className="page-header">
            <h2>Chat</h2>
            <button type="button" className="secondary" onClick={loadChat}>Refresh</button>
          </div>
          {message && <p className="error">{message}</p>}
          <div className="panel">
            {loading ? (
              <p className="muted">Loading messages...</p>
            ) : chat.length === 0 ? (
              <p className="muted">No messages yet.</p>
            ) : (
              chat.map((c) => (
                <div className="message" key={c._id}>
                  <p>{c.message}</p>
                  <small className="muted">Sender: {typeof c.sender === "object" ? c.sender?.name : c.sender}</small>
                </div>
              ))
            )}
          </div>
          <form className="panel" onSubmit={send}>
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message" />
            <button type="submit">Send</button>
          </form>
        </main>
      </div>
    </div>
  );
}
