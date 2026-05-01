import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { login, register } from "../utils/api";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await login(username, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", data.role);
        navigate("/home");
      } else {
        await register(username, password, email, role);
        const data = await login(username, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", data.role);
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function continueAsGuest() {
    localStorage.setItem("username", "Guest");
    localStorage.setItem("role", "guest");
    navigate("/home");
  }

  return (
    <Layout hideBottomNav>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {mode === "login" ? "Sign in to AnnotateAI" : "Create your account"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {mode === "login" ? "Access your image intelligence workspace" : "Start labeling images with AI today"}
          </p>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: 28 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: "var(--bg)", borderRadius: 12 }}>
            <button onClick={() => setMode("login")} style={tabBtn(mode === "login")}>Sign In</button>
            <button onClick={() => setMode("register")} style={tabBtn(mode === "register")}>Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            <label style={lbl}>Username</label>
            <input className="input" type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="your_username" style={{ marginBottom: 16 }} />
            {mode === "register" && (
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom: 16 }} />
            )}
            {mode === "register" && (
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom: 16 }} />
            )}

            <label style={lbl}>Password</label>
            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ marginBottom: 16 }} />

            {mode === "register" && (
              <>
                <label style={lbl}>Role</label>
                <select className="input" value={role} onChange={e => setRole(e.target.value)} style={{ marginBottom: 16 }}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}

            {error && <div style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", padding: 10, borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: 14 }}>
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button onClick={continueAsGuest} className="btn-ghost" style={{ width: "100%", padding: 14 }}>
            Continue as Guest
          </button>
        </div>
      </div>
    </Layout>
  );
}

const tabBtn = (active) => ({
  flex: 1, padding: 10, borderRadius: 8, border: "none", cursor: "pointer",
  background: active ? "var(--bg2)" : "transparent",
  color: active ? "var(--accent)" : "var(--text-muted)",
  fontWeight: active ? 600 : 400, fontSize: 14,
  boxShadow: active ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
});
const lbl = { display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 };
