import { resolveImageUrl } from "../api/api";

export default function ProductCard({ p, order, canOrder }) {
  const statusClass = `tag ${p.status || "approved"}`;
  const healthClass = `tag ${p.health || "healthy"}`;
  const image = resolveImageUrl(p.imageUrl) || "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1000&q=60";

  return (
    <div className="product crop-card">
      <img className="crop-image" src={image} alt={p.name} />
      <div className="crop-header">
        <h3>{p.name}</h3>
        <span className={statusClass}>{p.status || "approved"}</span>
      </div>
      <p className="muted">{p.cropType || "grains"}</p>
      <div className="price-row">
        <div>
          <p className="muted">Price</p>
          <p className="value">Rs {p.price}</p>
        </div>
        <div>
          <p className="muted">Quantity</p>
          <p className="value">{p.quantity} Kg</p>
        </div>
      </div>
      <p className="muted">Mandi: {p.mandi}</p>
      <div className="row">
        <span className={healthClass}>{p.health || "healthy"}</span>
        <span className="muted">{p.farmerId?.name || "Farmer"}</span>
      </div>
      {canOrder ? (
        <button onClick={() => order(p)}>Request Order</button>
      ) : (
        <p className="muted">Login as trader to place order.</p>
      )}
    </div>
  );
}
