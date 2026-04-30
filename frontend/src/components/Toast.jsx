import { useState, useEffect } from "react";

let _show = null;

export function showToast(msg, type = "info", duration = 3000) {
  if (_show) _show({ msg, type, duration });
}

export function ToastHost() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    _show = (t) => {
      setToast(t);
      if (t.duration) setTimeout(() => setToast(null), t.duration);
    };
    return () => { _show = null; };
  }, []);

  if (!toast) return null;

  const colors = {
    success: { bg: "rgba(52,199,89,0.95)", icon: "check_circle" },
    error: { bg: "rgba(255,59,48,0.95)", icon: "error" },
    info: { bg: "rgba(0,102,204,0.95)", icon: "info" },
    warning: { bg: "rgba(245,180,0,0.95)", icon: "warning" },
  };
  const c = colors[toast.type] || colors.info;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, padding: "12px 20px", borderRadius: 14,
      background: c.bg, color: "white", display: "flex", alignItems: "center", gap: 10,
      fontSize: 14, fontWeight: 500, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      backdropFilter: "blur(10px)", maxWidth: "90vw",
      animation: "slideUp 0.3s ease",
    }}>
      <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 20 }}>{c.icon}</span>
      <span>{toast.msg}</span>
      <style>{`@keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
    </div>
  );
}

let _confirmShow = null;

export function showConfirm(opts) {
  return new Promise((resolve) => {
    if (_confirmShow) _confirmShow({ ...opts, resolve });
  });
}

export function ConfirmHost() {
  const [c, setC] = useState(null);

  useEffect(() => {
    _confirmShow = setC;
    return () => { _confirmShow = null; };
  }, []);

  if (!c) return null;

  const handle = (val) => {
    c.resolve(val);
    setC(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="glass" style={{ borderRadius: 20, padding: 28, width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: c.danger ? "rgba(255,59,48,0.1)" : "rgba(0,102,204,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <span className="material-symbols-outlined notranslate" translate="no" style={{ color: c.danger ? "var(--danger)" : "var(--accent)", fontSize: 26 }}>{c.icon || "help"}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{c.title || "Are you sure?"}</h3>
        {c.message && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>{c.message}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handle(false)} className="btn-ghost" style={{ flex: 1, padding: 11 }}>{c.cancelText || "Cancel"}</button>
          <button onClick={() => handle(true)} style={{ flex: 1, padding: 11, borderRadius: 12, border: "none", background: c.danger ? "var(--danger)" : "var(--accent)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{c.confirmText || "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}
