import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { setPendingImage } from "../utils/store";
import { isLoggedIn } from "../utils/api";
import { showToast } from "../components/Toast";
const API = process.env.REACT_APP_API_URL || "https://annotateai.onrender.com";

export default function Import() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef();

  function isValidUrl(u) {
    try {
      const parsed = new URL(u.trim());
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function handleImport() {
    setError("");
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid http or https URL.");
      return;
    }
    setPendingImage(trimmed);
    navigate("/detect");
  }

  async function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!isLoggedIn()) {
      showToast("Please sign in to use file import", "error");
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();
    setUploading(true);

    try {
      let urls = [];

      if (ext === "json") {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          urls = data.map(d => d.image_url || d.url || d.image).filter(Boolean);
        } else if (data.images) {
          urls = data.images.map(d => d.image_url || d.url || d.image).filter(Boolean);
        }
      } else if (ext === "csv") {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        const header = lines[0].toLowerCase();
        const urlIdx = header.split(",").findIndex(c => c.includes("url") || c.includes("image"));
        if (urlIdx === -1) throw new Error("CSV needs a column with 'url' or 'image' in header");
        urls = lines.slice(1).map(l => {
          const cells = l.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
          return cells[urlIdx];
        }).filter(Boolean);
      } else if (ext === "zip") {
        if (!window.JSZip) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
        const zip = await window.JSZip.loadAsync(file);
        const imageFiles = Object.keys(zip.files).filter(n => /\.(jpg|jpeg|png|webp)$/i.test(n) && !zip.files[n].dir);
        if (imageFiles.length === 0) throw new Error("No images found in ZIP");
        for (const name of imageFiles) {
          const blob = await zip.files[name].async("blob");
          const base64 = await blobToBase64(blob);
          urls.push(base64);
        }
      } else if (["xlsx", "xls"].includes(ext)) {
        if (!window.XLSX) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
        const buf = await file.arrayBuffer();
        const wb = window.XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws);
        urls = rows.map(r => r.image_url || r.url || r.image || r.IMAGE_URL || r.URL).filter(Boolean);
      } else {
        throw new Error("Unsupported file type: " + ext);
      }

      if (urls.length === 0) throw new Error("No image URLs found in file");

      setProgress({ done: 0, total: urls.length });
      showToast(`Found ${urls.length} images. Detecting...`, "info");

      const token = localStorage.getItem("token");
      let success = 0;
      for (let i = 0; i < urls.length; i++) {
        try {
          await fetch(`${API}/detect`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({ image_url: urls[i] }),
          });
          success++;
          setProgress({ done: i + 1, total: urls.length });
        } catch {}
      }

      showToast(`Imported ${success}/${urls.length} images!`, "success");
      setTimeout(() => navigate("/history"), 1500);
    } catch (err) {
      showToast("Import failed: " + err.message, "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  return (
    <Layout>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 6 }}>Import</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Bulk import from files or paste a single URL</p>

        <div className="glass" style={{ borderRadius: 20, padding: 24, marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>Bulk Import</label>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>ZIP (images), JSON / CSV / XLSX (with image URLs)</p>
          <button onClick={() => fileRef.current.click()} disabled={uploading} className="btn-ghost" style={{ width: "100%", padding: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 20, color: "var(--accent)" }}>folder_open</span>
            <span>{uploading ? `Processing ${progress.done}/${progress.total}...` : "Choose file"}</span>
          </button>
          <input ref={fileRef} type="file" accept=".zip,.json,.csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileImport} />
          {uploading && (
            <div style={{ marginTop: 12, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "var(--accent)", width: `${(progress.done / Math.max(progress.total, 1)) * 100}%`, transition: "width 0.4s" }} />
            </div>
          )}
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: 24, marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>Single URL</label>
          <input className="input" type="url" value={url} onChange={e => { setUrl(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleImport()}
            placeholder="https://example.com/image.jpg" style={{ marginBottom: 12 }} />
          {error && (
            <div style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", padding: 10, borderRadius: 10, fontSize: 12, marginBottom: 12 }}>
              {error}
            </div>
          )}
          <button onClick={handleImport} className="btn-primary" style={{ width: "100%", padding: 13 }}>Detect</button>
        </div>
      </div>
    </Layout>
  );
}
