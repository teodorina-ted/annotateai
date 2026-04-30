import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LANGUAGES, setLang, getCurrentLang } from "../utils/translate";
import { useTheme } from "../utils/useTheme";
import { isLoggedIn, logout } from "../utils/api";
import { showToast, showConfirm } from "../components/Toast";

export default function Nav() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navRouter = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef();

  useEffect(() => {
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const currentLang = getCurrentLang();
  const loggedIn = isLoggedIn();

  return (
    <header className="glass" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 56, padding: "0 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid var(--border)",
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text)", fontSize: 17, fontWeight: 600 }}>
        <span className="material-symbols-outlined notranslate" translate="no" style={{ color: "var(--accent)", fontSize: 20 }}>bubble_chart</span>
        <span className="notranslate" translate="no">AnnotateAI</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={toggle} style={btnIcon} title="Toggle theme">
          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 20 }}>
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <div ref={langRef} style={{ position: "relative" }}>
          <button onClick={() => setLangOpen(!langOpen)} style={{ ...btnIcon, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 1 }}>
            <span translate="no" className="notranslate">{currentLang.substring(0,2).toUpperCase()}</span>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 13 }}>expand_more</span>
          </button>
          {langOpen && (
            <div className="glass" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 190, maxHeight: 300, overflowY: "auto", borderRadius: 14, padding: 6, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 500 }}>
              {LANGUAGES.map(l => (
                <button key={l.code || "en"} onClick={() => setLang(l.code)} style={{ display: "block", padding: "10px 14px", borderRadius: 10, color: "var(--text)", fontSize: 13, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {(() => {
          const onLanding = location.pathname === "/";
          if (!loggedIn) {
            return (
              <Link to="/auth" style={{ ...btnIcon, color: "var(--accent)", textDecoration: "none" }} title="Sign in">
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 22 }}>home</span>
              </Link>
            );
          }
          if (onLanding) {
            return (
              <Link to="/home" style={{ ...btnIcon, color: "var(--accent)", textDecoration: "none" }} title="Dashboard">
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 22 }}>home</span>
              </Link>
            );
          }
          return (
            <button onClick={() => { showConfirm({ title: "Sign out?", danger: true, icon: "logout" }).then(ok => { if (ok) logout(); }); }} style={{ ...btnIcon, color: "var(--accent)" }} title="Sign out">
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 20 }}>power_settings_new</span>
            </button>
          );
        })()}
      </div>
    </header>
  );
}

const btnIcon = {
  background: "none", border: "none", cursor: "pointer",
  color: "var(--text-muted)", padding: 6, borderRadius: 8,
  display: "flex", alignItems: "center",
};
