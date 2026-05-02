import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { detect, isLoggedIn, getPendingImages } from "../utils/api";
import { getPendingImage, getPendingBulk } from "../utils/store";

const API = process.env.REACT_APP_API_URL || "https://annotateai.onrender.com";

export default function Detect() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [labels, setLabels] = useState([]);
  const [detections, setDetections] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [docId, setDocId] = useState(null);
  const [status, setStatus] = useState({ msg: "", type: "info", show: false });
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [aiMode, setAiMode] = useState(() => localStorage.getItem("aiMode") === "true");
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);

  function setAi(val) {
    setAiMode(val);
    localStorage.setItem("aiMode", val ? "true" : "false");
  }

  function showStatus(msg, type = "info") {
    setStatus({ msg, type, show: true });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get("review");
    if (reviewId) {
      loadReviewMode(reviewId);
      return;
    }
    const bulkUrls = getPendingBulk();
    if (bulkUrls && bulkUrls.length > 0) {
      runBulkDetection(bulkUrls);
      return;
    }
    const url = getPendingImage();
    if (url) {
      setImageUrl(url);
      runDetection(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReviewMode(startId) {
    try {
      const pending = await getPendingImages();
      if (!pending.length) {
        showStatus("No pending images to review!", "info");
        setTimeout(() => navigate("/history"), 1500);
        return;
      }
      const idx = pending.findIndex(i => i._id === startId);
      const startIdx = idx >= 0 ? idx : 0;
      setReviewQueue(pending);
      setReviewIdx(startIdx);
      showItem(pending[startIdx]);
      showStatus(`Reviewing ${startIdx + 1} of ${pending.length} pending`, "info");
    } catch (e) {
      showStatus("Could not load review queue: " + e.message, "error");
    }
  }

  function showItem(item) {
    setImageUrl(item.image_url);
    setLabels(item.labels || []);
    setDetections(item.detections || []);
    setMetadata(item.metadata || null);
    setDocId(item._id);
    setShowActions(true);
    setAiMode(false);
    localStorage.setItem("aiMode", "false");
  }

  function navReview(direction) {
    const newIdx = reviewIdx + direction;
    if (newIdx < 0 || newIdx >= reviewQueue.length) return;
    setReviewIdx(newIdx);
    showItem(reviewQueue[newIdx]);
    showStatus(`Reviewing ${newIdx + 1} of ${reviewQueue.length} pending`, "info");
  }

  async function runBulkDetection(urls) {
    showStatus(`Bulk detecting ${urls.length} images...`, "info");
    setLoading(true);
    let success = 0;
    for (let i = 0; i < urls.length; i++) {
      try {
        await detect(urls[i]);
        success++;
        showStatus(`${i + 1}/${urls.length} processed...`, "info");
      } catch (e) {
        console.warn("Bulk failed:", e);
      }
    }
    setLoading(false);
    showStatus(`Done! ${success}/${urls.length} added with pending status.`, "success");
    setTimeout(() => navigate("/history"), 1500);
  }

  async function runDetection(url) {
    setLoading(true);
    showStatus("Analyzing image with YOLO + Gemini...", "info");
    try {
      const data = await detect(url);
      setLabels(data.labels || []);
      setDetections(data.detections || []);
      setMetadata(data.metadata || null);
      setDocId(data.id || null);
      const saved = data.saved && isLoggedIn();
      setShowActions(true);
      if (!isLoggedIn()) {
        const guestImages = JSON.parse(sessionStorage.getItem("guestImages") || "[]");
        if (guestImages.length >= 3) {
          showStatus("Guest limit: 3 images max. Sign in for unlimited!", "info");
        } else {
          guestImages.push({ _id: "g" + Date.now(), image_url: imageUrl, labels: data.labels || [], detections: data.detections || [], status: "pending", date: new Date().toISOString() });
          sessionStorage.setItem("guestImages", JSON.stringify(guestImages));
        }
      }
      showStatus(`${(data.labels || []).length} objects detected${saved ? " - Review and approve" : " - Guest mode (max 3 images)"}`, "success");
    } catch (e) {
      showStatus("Detection failed: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function callUpdate(body) {
    if (!isLoggedIn()) {
      showStatus("Guest mode: action noted but not saved. Sign in to keep your work!", "info");
      return true;
    }
    if (!docId) {
      return true;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/images/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      return true;
    } catch (e) {
      showStatus("Could not save: " + e.message, "error");
      return false;
    }
  }

  function afterAction(messageOk) {
    if (reviewQueue.length > 0) {
      const updated = reviewQueue.filter((_, i) => i !== reviewIdx);
      setReviewQueue(updated);
      if (updated.length === 0) {
        showStatus("All pending reviewed! Going to History...", "success");
        setTimeout(() => navigate("/history"), 1000);
      } else {
        const nextIdx = Math.min(reviewIdx, updated.length - 1);
        setReviewIdx(nextIdx);
        showItem(updated[nextIdx]);
        showStatus(`${messageOk} - ${updated.length} pending left`, "success");
      }
    } else {
      showStatus(messageOk, "success");
      setShowActions(false);
      setTimeout(() => navigate("/history"), 1200);
    }
  }

  async function handleApprove() {
    const targetStatus = aiMode ? "ai_generated" : "approved";
    const ok = await callUpdate({ status: targetStatus, labels });
    if (ok) afterAction(aiMode ? "Saved as AI Generated" : "Approved!");
  }

  async function handleSkip() {
    const ok = await callUpdate({ status: "pending", labels });
    if (ok) afterAction("Skipped");
  }

  async function handleDiscard() {
    const ok = await (await import("../components/Toast")).showConfirm({ title: "Discard image?", message: "This will permanently delete it.", danger: true, icon: "delete", confirmText: "Discard" });
    if (!ok) return;
    if (!docId) { afterAction("Discarded"); return; }
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/images/${docId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      afterAction("Discarded");
    } catch (e) {
      showStatus("Discard failed: " + e.message, "error");
    }
  }

  function handleEdit() {
    setEditValue(labels.join(", "));
    setEditing(true);
  }

  async function saveEdit() {
    const newLabels = editValue.split(",").map(s => s.trim()).filter(Boolean);
    const ok = await callUpdate({ labels: newLabels, status: "pending" });
    if (ok) {
      setLabels(newLabels);
      setDetections(newLabels.map(l => ({ label: l, confidence: 100 })));
      setEditing(false);
      showStatus("Labels updated. Now choose Approve or Skip.", "success");
    }
  }

  const uniqueLabels = [...new Set(labels)];
  const inReview = reviewQueue.length > 0;

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <a href="/home" style={{ fontSize: 13, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16 }}>arrow_back</span> Back
          </a>
          <button onClick={() => navigate("/history")} title="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4 }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>{inReview ? "Review Annotation" : "Object Detection"}</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 18 }}>{inReview ? "Navigate through pending images and decide for each" : "AI identifies and labels every object in your image"}</p>

{inReview && (
          <div style={{ textAlign: "center", marginBottom: 12, fontSize: 13, fontWeight: 600, color: "var(--accent)" }} className="notranslate" translate="no">
            {reviewIdx + 1} / {reviewQueue.length} pending
          </div>
        )}

        {status.show && (
          <div style={{
            padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 16,
            background: status.type === "success" ? "rgba(52,199,89,0.1)" : status.type === "error" ? "rgba(255,59,48,0.1)" : "rgba(0,102,204,0.1)",
            color: status.type === "success" ? "var(--success)" : status.type === "error" ? "var(--danger)" : "var(--accent)",
          }}>{status.msg}</div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16, padding: "0 40px", position: "relative" }} className="detect-grid">
        {inReview && (
          <>
            <button onClick={() => navReview(-1)} disabled={reviewIdx === 0} title="Previous" className="review-arrow review-arrow-left" style={{ background: "none", border: "none", cursor: reviewIdx === 0 ? "not-allowed" : "pointer", opacity: reviewIdx === 0 ? 0.25 : 0.7, color: "var(--accent)", padding: 0 }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 36 }}>chevron_left</span>
            </button>
            <button onClick={() => navReview(1)} disabled={reviewIdx === reviewQueue.length - 1} title="Next" className="review-arrow review-arrow-right" style={{ background: "none", border: "none", cursor: reviewIdx === reviewQueue.length - 1 ? "not-allowed" : "pointer", opacity: reviewIdx === reviewQueue.length - 1 ? 0.25 : 0.7, color: "var(--accent)", padding: 0 }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 36 }}>chevron_right</span>
            </button>
          </>
        )}
          <div style={{ position: "relative" }}>
            <div className="glass" style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {imageUrl ? (
                <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 48, color: "var(--text-muted)", opacity: 0.3 }}>image</span>
              )}
            </div>
            {inReview && (
              <>
                
              </>
            )}
          </div>

          <div className="glass" style={{ borderRadius: 16, padding: 14, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", margin: 0 }}>Detected Labels</p>
              <button onClick={handleEdit} title="Edit labels" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--success)", padding: 4, borderRadius: 6, display: "flex" }}>
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>edit</span>
              </button>
            </div>

            {uniqueLabels.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{loading ? "Detecting..." : "No labels yet. Click the pen to add."}</p>
            ) : (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {uniqueLabels.map(l => (
                    <span key={l} style={{ padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600, background: "rgba(0,102,204,0.1)", color: "var(--accent)", border: "1px solid rgba(0,102,204,0.2)" }}>{l}</span>
                  ))}
                </div>

                {detections.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 90 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{d.label}</span>
                      {d.category && d.category !== "other" && (
                        <span style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d.category}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--accent)", width: `${d.confidence}%`, transition: "width 0.6s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, minWidth: 36, textAlign: "right" }}>{d.confidence}%</span>
                  </div>
                ))}
              </>
            )}

            {metadata && metadata.objects && metadata.objects.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 13, verticalAlign: "middle", color: "#d4a017" }}>auto_awesome</span> AI Insights
                </p>
                {metadata.objects.map((obj, i) => (
                  <div key={i} style={{ marginBottom: 10, padding: 10, background: "var(--bg)", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{obj.label}</span>
                      {obj.subcategory && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 6, background: "rgba(0,102,204,0.1)", color: "var(--accent)" }}>{obj.subcategory}</span>}
                    </div>
                    {obj.details && Object.keys(obj.details).length > 0 && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {Object.entries(obj.details).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 6 }}>
                            <span style={{ minWidth: 80, textTransform: "capitalize", fontWeight: 500 }}>{k.replace(/_/g, " ")}:</span>
                            <span style={{ flex: 1 }}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showActions && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Decision:</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                  <button onClick={() => setAi(!aiMode)} title="Toggle AI Mode" style={{ padding: "10px 6px", borderRadius: 12, border: aiMode ? "1px solid #d4a017" : "1px solid var(--border)", background: aiMode ? "rgba(245,180,0,0.15)" : "var(--bg2)", color: aiMode ? "#a17800" : "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 14, color: aiMode ? "#d4a017" : "var(--text-muted)" }}>auto_awesome</span>
                    <span className="notranslate" translate="no" style={{ fontSize: 11 }}>AI</span>
                    <span style={{ width: 22, height: 12, borderRadius: 6, background: aiMode ? "#d4a017" : "var(--border)", position: "relative", display: "inline-block" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: aiMode ? 12 : 2, transition: "left 0.2s" }} />
                    </span>
                  </button>
                  <button onClick={handleApprove} className="btn-primary" style={{ padding: 10, fontSize: 13 }}>Approve</button>
                  <button onClick={handleSkip} className="btn-ghost" style={{ padding: 10, fontSize: 13 }}>Skip</button>
                  <button onClick={handleDiscard} title="Discard" style={{ padding: 10, background: "rgba(255,59,48,0.1)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.3)", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 22, fontWeight: 700 }}>close</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div className="glass" style={{ borderRadius: 20, padding: 28, width: "100%", maxWidth: 440 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Edit Labels</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Comma-separated labels.</p>
              <input className="input" value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="person, car, dog..." style={{ marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveEdit} className="btn-primary" style={{ flex: 1 }}>Save</button>
                <button onClick={() => setEditing(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .review-arrow { position: absolute; top: calc(37.5% * 0.75 + 8px); transform: translateY(-50%); display: flex; align-items: center; justify-content: center; z-index: 5; }
        .review-arrow-left { left: 0; }
        .review-arrow-right { right: 0; }
        @media (max-width: 768px) {
          .detect-grid { grid-template-columns: 1fr !important; padding: 0 30px !important; }
          .review-arrow { top: 30%; }
        }
      `}</style>
    </Layout>
  );
}
