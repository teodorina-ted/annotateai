import Layout from "../components/Layout";

export default function Legal() {
  const path = window.location.pathname;
  const title = path.includes("privacy") ? "Privacy Policy"
    : path.includes("terms") ? "Terms of Service"
    : path.includes("cookie") ? "Cookie Policy"
    : path.includes("gdpr") ? "GDPR"
    : path.includes("qa") ? "QA Policy"
    : path.includes("help") ? "Help Center"
    : "Legal Information";

  return (
    <Layout hideBottomNav>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        <a href="/" style={{ fontSize: 13, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16 }}>arrow_back</span> Back
        </a>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{title}</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Last updated: April 30, 2026</p>

        <div className="glass" style={{ borderRadius: 16, padding: 24, lineHeight: 1.7 }}>
          <p style={{ fontSize: 14 }}>
            AnnotateAI is a student project built for the DevOPS course at ITS Olivetti by Teodorina Lungu under Professor Stefano Castagnoli.
          </p>
          <br />
          <p style={{ fontSize: 14 }}>
            This is a demo/educational application. No personal data is sold. Image uploads are stored in MongoDB and processed by YOLO and Google Gemini for object detection. Users can delete their data at any time from the History page.
          </p>
          <br />
          <p style={{ fontSize: 14 }}>
            For questions, contact: <a href="mailto:teodorina.business@gmail.com" style={{ color: "var(--accent)" }}>teodorina.business@gmail.com</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
