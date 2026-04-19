const sectionsByRole = {
  farmer: [
    {
      title: "Farmer",
      links: [
        { href: "/farmer-dashboard", label: "Dashboard" },
        { href: "/crop-listings", label: "Crop Listings" },
        { href: "/orders", label: "Orders" }
      ]
    }
  ],
  trader: [
    {
      title: "Trader",
      links: [
        { href: "/trader-dashboard", label: "Dashboard" },
        { href: "/crop-listings", label: "Crop Listings" },
        { href: "/orders", label: "Orders" }
      ]
    }
  ],
  admin: [
    {
      title: "Admin",
      links: [
        { href: "/admin-dashboard", label: "Dashboard" },
        { href: "/browse", label: "Crop Listings" },
        { href: "/orders", label: "Order Monitoring" },
        { href: "/chat", label: "Community Chat" }
      ]
    }
  ]
};

export default function Sidebar({ path = "/", navigate = () => {} }) {
  const role = localStorage.getItem("role");
  const sections = sectionsByRole[role] || [];

  return (
    <aside className="sidebar">
      <div className="location-pill">
        <p className="muted">Location</p>
        <strong>Pune (Default)</strong>
      </div>
      <h2>AgroVision</h2>
      <p className="sidebar-subtitle">Fresh crop trading and farm coordination in one place.</p>
      {sections.map((section) => (
        <div key={section.title} className="sidebar-section">
          <p className="sidebar-section-title">{section.title}</p>
          {section.links.map((link) => (
            <button
              className={path === link.href ? "active" : ""}
              type="button"
              onClick={() => navigate(link.href)}
              key={`${section.title}-${link.href}`}
            >
              {link.label}
            </button>
          ))}
        </div>
      ))}
      <div className="sidebar-section">
        <button
          className={path === "/edit-profile" ? "active" : ""}
          type="button"
          onClick={() => navigate("/edit-profile")}
        >
          Edit Profile
        </button>
      </div>
    </aside>
  );
}
