import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const { pathname } = useLocation();

  const items = [
    { to: "/home", icon: "cloud_upload", label: "Upload" },
    { to: "/history", icon: "database", label: "History" },
    { to: "/import", icon: "link", label: "Import" },
    { to: "/profile", icon: "person", label: "Profile" },
  ];

  return (
    <nav className="glass" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      height: 64, display: "flex", justifyContent: "space-around", alignItems: "center",
      borderTop: "1px solid var(--border)",
    }}>
      {items.map(item => {
        const active = pathname === item.to;
        return (
          <Link key={item.to} to={item.to} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            color: active ? "var(--accent)" : "var(--text-muted)",
            fontSize: 11, fontWeight: 500,
          }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 22 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
