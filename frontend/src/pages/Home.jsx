import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getImages, getUsername, isLoggedIn } from "../utils/api";
import { setPendingImage, setPendingBulk } from "../utils/store";
import { showToast, showConfirm } from "../components/Toast";
const API = process.env.REACT_APP_API_URL || "https://annotateai.onrender.com";

export default function Home() {
  const navigate = useNavigate();
  const username = getUsername();
  const [recent, setRecent] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const videoRef = useRef();
  const canvasRef = useRef();
  const singleRef = useRef();
  const bulkRef = useRef();

  useEffect(() => {
    if (isLoggedIn()) {
      getImages().then(d => setRecent((d.images || []).reverse().slice(0, 3))).catch(() => {});
    }
  }, []);

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSingle(e) {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setPendingImage(base64);
    navigate("/detect");
  }

  async function handleBulk(e) {
    const files = Array.from(e.target.files);
    if (!files.length || !isLoggedIn()) {
      if (!isLoggedIn()) showToast("Please sign in to use bulk upload", "info");
      return;
    }
    setBulkUploading(true);
    setBulkProgress({ done: 0, total: files.length });
    let success = 0;
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await fileToBase64(files[i]);
        const token = localStorage.getItem("token");
        await fetch(`${API}/detect`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ image_url: base64 }),
        });
        success++;
        setBulkProgress({ done: i + 1, total: files.length });
      } catch (err) {
        console.warn("Bulk item failed:", err);
      }
    }
    setBulkUploading(false);
    showToast(`Bulk done! ${success}/${files.length} images uploaded with pending status. Go to History to review.`, "success");
    navigate("/history");
  }

  async function openCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 50);
    } catch (e) {
      alert("Camera not available: " + e.message);
    }
  }

  function closeCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOpen(false);
  }

  function capturePhoto() {
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    setPendingImage(c.toDataURL("image/jpeg"));
    closeCamera();
    navigate("/detect");
  }

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Welcome back</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Hello, {username}</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>What would you like to do today?</p>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, background: "var(--accent)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 24px rgba(0,102,204,0.25)" }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ color: "white", fontSize: 24 }}>upload_file</span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Upload Image</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Run AI detection on one or many images.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <button onClick={() => singleRef.current.click()} className="btn-primary" style={{ padding: "10px 8px", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>image</span>
              <span>Single image</span>
            </button>
            <button onClick={openCamera} className="btn-ghost" style={{ padding: "10px 8px", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--accent)" }}>photo_camera</span>
              <span>Camera</span>
            </button>
            <button onClick={() => bulkRef.current.click()} className="btn-ghost" style={{ padding: "10px 8px", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--accent)" }}>folder_open</span>
              <span className="notranslate" translate="no">Bulk</span>
            </button>
          </div>

          <input ref={singleRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleSingle} />
          <input ref={bulkRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleBulk} />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Recent Detections</p>
            <a href="/history" style={{ fontSize: 13, color: "var(--accent)" }}>View all →</a>
          </div>
          {!isLoggedIn() ? (
            <div className="glass" style={{ borderRadius: 14, padding: 20, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
              Sign in to see your history.
            </div>
          ) : recent.length === 0 ? (
            <div className="glass" style={{ borderRadius: 14, padding: 20, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
              No detections yet. Upload your first image!
            </div>
          ) : (
            recent.map((img, i) => (
              <div key={i} className="glass" style={{ borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14, marginBottom: 8, cursor: "pointer" }}
                onClick={() => { setPendingImage(img.image_url); navigate("/detect"); }}>
                <img src={img.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", background: "var(--bg)" }} onError={e => e.target.style.display = "none"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                    {(img.labels || []).slice(0, 3).map((l, j) => (
                      <span key={j} style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "rgba(0,102,204,0.1)", color: "var(--accent)" }}>{l}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(img.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {bulkUploading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="glass" style={{ borderRadius: 24, padding: 32, width: "100%", maxWidth: 420, textAlign: "center" }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 48, color: "var(--accent)", marginBottom: 12, display: "block" }}>folder_open</span>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Uploading bulk</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>{bulkProgress.done} of {bulkProgress.total} processed</p>
            <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", background: "var(--accent)", width: `${(bulkProgress.done / Math.max(bulkProgress.total, 1)) * 100}%`, transition: "width 0.4s" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Each image runs YOLO + Gemini AI (~5 sec each)</p>
          </div>
        </div>
      )}

      {cameraOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="glass" style={{ borderRadius: 24, padding: 24, width: "100%", maxWidth: 480 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Take Photo</h3>
            <video ref={videoRef} style={{ width: "100%", borderRadius: 16, background: "#000" }} autoPlay playsInline />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={capturePhoto} className="btn-primary" style={{ flex: 1, padding: 12 }}>Capture</button>
              <button onClick={closeCamera} className="btn-ghost" style={{ flex: 1, padding: 12 }}>Cancel</button>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </div>
      )}
    </Layout>
  );
}
