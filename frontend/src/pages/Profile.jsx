import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getImages, getUsername, getRole, isLoggedIn, logout } from "../utils/api";
import { useTheme } from "../utils/useTheme";
import { getCurrentLang } from "../utils/translate";

export default function Profile() {
  const [stats, setStats] = useState({ total: 0, unique: 0 });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { theme, toggle } = useTheme();
  const username = getUsername();
  const role = getRole();
  const lang = getCurrentLang();

  useEffect(() => {
    if (!isLoggedIn()) return;
    getImages().then(d => {
      const images = d.images || [];
      const unique = new Set(images.flatMap(i => i.labels || [])).size;
      setStats({ total: images.length, unique });
    }).catch(() => {});
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32, fontWeight: 700, color: "white" }}>
            {username.substring(0, 2).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{username}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{role.charAt(0).toUpperCase() + role.slice(1)} Account</p>
        </div>

        {isLoggedIn() && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[["database", stats.total, "Total Detections"], ["label", stats.unique, "Unique Labels"]].map(([icon, val, label], i) => (
              <div key={i} className="glass" style={{ borderRadius: 16, padding: 18, textAlign: "center" }}>
                <span className="material-symbols-outlined notranslate" translate="no" style={{ color: "var(--accent)", fontSize: 22, display: "block", marginBottom: 6 }}>{icon}</span>
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{val}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <Section title="Appearance">
          <Row>
            <RowLeft icon="dark_mode" label="Dark Mode" />
            <button onClick={toggle} style={{ width: 44, height: 24, borderRadius: 12, background: theme === "dark" ? "var(--accent)" : "var(--border)", border: "none", cursor: "pointer", position: "relative" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: theme === "dark" ? 23 : 3, transition: "left 0.2s" }} />
            </button>
          </Row>
          <Row last>
            <RowLeft icon="language" label="Language" />
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{lang}</span>
          </Row>
        </Section>

        <Section title="Account">
          <a href="/history" style={{ textDecoration: "none", display: "block" }}>
            <Row>
              <RowLeft icon="database" label="My History" />
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--text-muted)" }}>chevron_right</span>
            </Row>
          </a>
          <a href="/privacy" style={{ textDecoration: "none", display: "block" }}>
            <Row>
              <RowLeft icon="shield" label="Privacy Center" />
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--text-muted)" }}>chevron_right</span>
            </Row>
          </a>
          <a href="/help" style={{ textDecoration: "none", display: "block" }}>
            <Row last>
              <RowLeft icon="help" label="Help Center" />
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--text-muted)" }}>chevron_right</span>
            </Row>
          </a>
        </Section>

        {isLoggedIn() && (
          <button onClick={() => setConfirmLogout(true)} style={{ width: "100%", padding: 14, borderRadius: 16, border: "none", background: "rgba(255,59,48,0.1)", color: "var(--danger)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>logout</span> Sign Out
          </button>
        )}
      </div>
    
      {confirmLogout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="glass" style={{ borderRadius: 20, padding: 28, width: "100%", maxWidth: 400, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,59,48,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ color: "var(--danger)", fontSize: 28 }}>logout</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Sign out?</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>You will need to sign in again to access your data.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmLogout(false)} className="btn-ghost" style={{ flex: 1, padding: 12 }}>No, stay</button>
              <button onClick={logout} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "var(--danger)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Yes, sign out</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Section({ title, children }) {
  return (
    <div className="glass" style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function Row({ children, last }) {
  return (
    <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

function RowLeft({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="material-symbols-outlined notranslate" translate="no" style={{ color: "var(--accent)" }}>{icon}</span>
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}
