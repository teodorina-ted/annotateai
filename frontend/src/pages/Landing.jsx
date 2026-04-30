import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Landing() {
  return (
    <Layout hideBottomNav>
      <style>{`main:has(.landing-wrap) { max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }`}</style>
      <div className="landing-wrap">
      <section className="fade-in" style={{ padding: "20px 16px 50px", position: "relative" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", textAlign: "center" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(0,102,204,0.08)", border: "1px solid rgba(0,102,204,0.15)", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Powered by YOLO AI</span>
          </div>

          <h1 style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.05, marginBottom: 20, color: "var(--text)" }}>
            Your images,<br />
            <span style={{ color: "var(--accent)" }}>intelligently</span> labeled.
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", marginBottom: 28, fontWeight: 300, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 28px" }}>
            Upload any photo. Let AI detect every object — review, annotate, build your dataset in seconds.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            <Link to="/auth" className="btn-primary" style={{ padding: "14px 32px", fontSize: 15, textDecoration: "none" }}>Start for free</Link>
            <a href="#how" className="btn-ghost" style={{ padding: "14px 32px", fontSize: 15, textDecoration: "none" }}>See how it works</a>
          </div>

          <div style={{ position: "relative", maxWidth: 1080, margin: "32px auto 0" }}>
            <div style={{ position: "absolute", inset: "-40px", background: "radial-gradient(ellipse at center, rgba(0,102,204,0.35) 0%, transparent 65%)", filter: "blur(40px)", zIndex: 0 }} />
            <img src="/images/ai-hero.png" alt="AI Detection Visualization" style={{ width: "100%", display: "block", borderRadius: 20, position: "relative", zIndex: 1, boxShadow: "0 20px 60px rgba(0,102,204,0.25)" }} />
          </div>

        </div>
      </section>

      <section id="how" style={{ padding: "30px 24px 60px", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>How it works</h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", fontWeight: 300 }}>Three steps to intelligent image data</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              ["add_a_photo", "Upload or Capture", "Take a photo or drag any image. Supports bulk uploads."],
              ["psychology", "AI Detects", "YOLO scans your image and identifies every object with confidence scores."],
              ["verified", "Review and Approve", "Approve, edit, or correct labels. Your feedback improves accuracy."],
              ["download", "Download or Share", "Export your annotated dataset as JSON, CSV, TXT or ZIP — ready for training."],
            ].map(([icon, title, desc], i) => (
              <div key={i} className="glass" style={{ borderRadius: 20, padding: 24 }}>
                <div style={{ width: 44, height: 44, background: "rgba(0,102,204,0.1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ color: "var(--accent)" }}>{icon}</span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}><span className="notranslate" translate="no">Step 0{i + 1}</span></p>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>{title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: "32px 16px 20px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ color: "var(--accent)", fontSize: 18 }}>bubble_chart</span>
              <span className="notranslate" translate="no" style={{ fontWeight: 600, color: "var(--text)" }}>AnnotateAI</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>AI-powered image annotation project.</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0" }}>Course: <span className="notranslate" translate="no">DevOPS · ITS Olivetti</span></p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0" }}>Student: <span className="notranslate" translate="no">Teodorina Lungu</span></p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0" }}>Professor: <span className="notranslate" translate="no">Stefano Castagnoli</span></p>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <a href="https://www.linkedin.com/in/teodorina-lungu-631577172" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={socialBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14M18.5 18.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="https://github.com/teodorina-ted" target="_blank" rel="noopener noreferrer" title="GitHub" style={socialBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.64.71 1.03 1.61 1.03 2.71 0 3.84-2.34 4.68-4.57 4.93.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              </a>
              <a href="mailto:teodorina.business@gmail.com" title="Email" style={socialBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </a>
              <a href="http://wa.me/393281452170" target="_blank" rel="noopener noreferrer" title="WhatsApp" style={socialBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.27h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.79M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.96 9.96 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/></svg>
              </a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 12 }}>
            {[
              ["Privacy Policy", "/privacy"],
              ["Terms of Service", "/terms"],
              ["Cookie Policy", "/cookies"],
              ["GDPR", "/gdpr"],
              ["QA Policy", "/qa-policy"],
            ].map(([l, href]) => (
              <a key={l} href={href} style={{ fontSize: 12, color: "var(--text-muted)" }}>{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>© 2026 <span className="notranslate" translate="no">AnnotateAI</span>. All rights reserved.</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Built with <span className="notranslate" translate="no">YOLO · Gemini · Flask · MongoDB · Docker · REST API · JWT</span></span>
          </div>
        </div>
      </footer>
      </div>
    </Layout>
  );
}

const socialBtn = {
  width: 32, height: 32, borderRadius: 8,
  background: "var(--bg2)", border: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "var(--text-muted)", textDecoration: "none",
  transition: "all 0.2s",
};
