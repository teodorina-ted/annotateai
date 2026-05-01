import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getImages, isLoggedIn, deleteImage, bulkDelete } from "../utils/api";
import { setPendingImage } from "../utils/store";
import { showToast, showConfirm } from "../components/Toast";

export default function History() {
  const navigate = useNavigate();
  const [allImages, setAllImages] = useState([]);
  const [labelFilter, setLabelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [exportMenu, setExportMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  useEffect(() => { load(); }, []);

  function load() {
    if (!isLoggedIn()) { setLoading(false); return; }
    setLoading(true);
    getImages()
      .then(d => setAllImages((d.images || []).reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  if (!isLoggedIn()) {
    return <Layout><p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Please sign in to see your history.</p></Layout>;
  }

  const labels = [...new Set(allImages.flatMap(i => i.labels || []))];
  const categories = [...new Set(allImages.flatMap(i => (i.detections || []).map(d => d.category).filter(Boolean)))];
  const last = allImages[0] ? new Date(allImages[0].date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";
  const filtered = allImages.filter(img => {
    const imgCategories = (img.detections || []).map(d => d.category);
    const matchLabel = !labelFilter || imgCategories.includes(labelFilter);
    const effectiveStatus = img.status === "approved" ? "approved" : img.status === "ai_generated" ? "ai_generated" : "pending";
    const matchStatus = !statusFilter || effectiveStatus === statusFilter;
    const matchSearch = !search || (img.labels || []).some(l => l.toLowerCase().includes(search.toLowerCase()));
    const imgDate = new Date(img.date);
    const matchFrom = !dateFrom || imgDate >= new Date(dateFrom);
    const matchTo = !dateTo || imgDate <= new Date(dateTo + "T23:59:59");
    return matchLabel && matchStatus && matchSearch && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageStart = (page - 1) * perPage;
  const paged = filtered.slice(pageStart, pageStart + perPage);

  function toggleSelect(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(i => i._id)));
  }

  async function handleDelete(id) {
    const __ok = await showConfirm({ title: "Delete this detection?", danger: true, icon: "warning" });
    if (!__ok) return;
    try { await deleteImage(id); load(); }
    catch (e) { alert("Delete failed: " + e.message); }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} detections?`)) return;
    try {
      await bulkDelete([...selected]);
      setSelected(new Set());
      load();
    } catch (e) { alert("Bulk delete failed: " + e.message); }
  }

  async function exportData(format) {
    const data = selected.size > 0 ? allImages.filter(i => selected.has(i._id)) : allImages;
    setExportMenu(false);

    if (format === "json") {
      downloadFile(JSON.stringify(data, null, 2), "annotateai_history.json", "application/json");
    } else if (format === "csv") {
      const rows = [["ID", "Labels", "Status", "Date"]];
      data.forEach(i => rows.push([i._id, (i.labels || []).join("; "), i.status || "pending", new Date(i.date).toISOString()]));
      const escapeCsv = (val) => '"' + String(val).split('"').join('""') + '"';
      const csv = rows.map(r => r.map(escapeCsv).join(",")).join("\n");
      downloadFile(csv, "annotateai_history.csv", "text/csv");
    } else if (format === "txt") {
      const txt = data.map(i => `${new Date(i.date).toLocaleString()} | ${i.status || "pending"} | ${(i.labels || []).join(", ")}`).join("\n");
      downloadFile(txt, "annotateai_history.txt", "text/plain");
    } else if (format === "zip") {
      if (!window.JSZip) {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
      }
      const zip = new window.JSZip();
      let count = 0;
      for (const img of data) {
        try {
          // Determine YOLO category + label folders
          const cats = (img.detections || []).map(d => d.category).filter(Boolean);
          const mainCat = cats[0] || "other";
          const mainLabel = (img.labels && img.labels[0]) || "unlabeled";

          // Build rich filename from Gemini details
          let detailParts = [];
          if (img.metadata && img.metadata.objects && img.metadata.objects.length > 0) {
            const firstObj = img.metadata.objects[0];
            const d = firstObj.details || {};
            // Pull useful descriptors
            ["breed", "species", "brand", "model", "type", "gender", "age_group", "color"].forEach(k => {
              if (d[k]) detailParts.push(String(d[k]));
            });
            if (firstObj.subcategory) detailParts.push(firstObj.subcategory);
          }

          // Sanitize
          const sanitize = (s) => s.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
          const safeMain = sanitize(mainCat);
          const safeLabel = sanitize(mainLabel);
          const safeDetails = detailParts.map(sanitize).filter(Boolean).join("_");

          // Save image
          let blob;
          let ext = "jpg";
          if (img.image_url.startsWith("data:")) {
            const base64 = img.image_url.split(",")[1];
            ext = img.image_url.includes("png") ? "png" : "jpg";
            blob = base64ToBlob(base64, "image/" + ext);
          } else {
            const res = await fetch(img.image_url);
            blob = await res.blob();
          }

          const idShort = img._id.slice(-6);
          const filename = safeDetails
            ? `${safeDetails}_${idShort}`
            : `img_${count + 1}_${idShort}`;
          const folder = `${safeMain}/${safeLabel}`;
          zip.file(`${folder}/${filename}.${ext}`, blob);

          // Save metadata as JSON next to image
          const meta = {
            id: img._id,
            labels: img.labels,
            detections: img.detections,
            ai_insights: img.metadata,
            status: img.status,
            date: img.date,
          };
          zip.file(`${folder}/${filename}.json`, JSON.stringify(meta, null, 2));
          count++;
        } catch (e) { console.warn("Skipped:", e); }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadFile(blob, "annotateai_dataset.zip", "application/zip");
    }
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

  function base64ToBlob(b64, type) {
    const byteChars = atob(b64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    return new Blob([bytes], { type });
  }

  function downloadFile(content, filename, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  function openReview(id) {
    navigate(`/detect?review=${id}`);
  }

  const statusBadge = (status) => {
    if (status === "approved") return { bg: "rgba(52,199,89,0.15)", c: "#22994a" };
    if (status === "ai_generated") return { bg: "rgba(245,180,0,0.18)", c: "#a17800" };
    return { bg: "rgba(142,142,147,0.15)", c: "var(--text-muted)" };
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Detection History</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>All your past detections</p>
        </div>
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="btn-ghost" style={{ fontSize: 13, padding: "10px 16px", color: "var(--danger)", borderColor: "var(--danger)" }}>
              <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16, marginRight: 4 }}>delete</span>
              Delete ({selected.size})
            </button>
          )}
          <button onClick={() => setExportMenu(!exportMenu)} className="btn-ghost" style={{ fontSize: 13, padding: "10px 16px" }}>
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16, marginRight: 4 }}>download</span>
            Export
          </button>
          {exportMenu && (
            <div className="glass" style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, borderRadius: 12, padding: 6, minWidth: 200, zIndex: 50, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px 4px 14px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Export as</span>
                <button onClick={() => setExportMenu(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2, display: "flex" }}>
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 16 }}>close</span>
                </button>
              </div>
              {[
                ["json", "JSON (data)"],
                ["csv", "CSV (spreadsheet)"],
                ["txt", "TXT (text)"],
                ["zip", "ZIP (images)"],
              ].map(([f, label]) => (
                <button key={f} onClick={() => exportData(f)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "none", color: "var(--text)", fontSize: 13, cursor: "pointer", borderRadius: 8 }}>
                  <span className="notranslate" translate="no">.{f}</span> <span style={{ color: "var(--text-muted)", fontSize: 11 }}>— {label.split(" ")[1]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div className="glass" style={{ borderRadius: 14, padding: 14 }}>
          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--accent)", display: "block", marginBottom: 4 }}>database</span>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{allImages.length}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total</div>
        </div>
        <div className="glass" style={{ borderRadius: 14, padding: 14 }}>
          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--accent)", display: "block", marginBottom: 4 }}>label</span>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{labels.length}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Labels</div>
        </div>
        <div className="glass" style={{ borderRadius: 14, padding: 14, position: "relative", cursor: "pointer" }}>
          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18, color: "var(--accent)", display: "block", marginBottom: 4 }}>calendar_today</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", border: "none" }} />
          <div style={{ fontSize: 16, fontWeight: 700 }}>{dateFrom ? new Date(dateFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) : last}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{dateFrom ? "Filter from" : "Last"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 16 }} className="filter-row">
        <div style={{ position: "relative", minWidth: 0 }}>
          <span className="material-symbols-outlined notranslate" translate="no" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-muted)" }}>search</span>
          <input className="input" type="text" placeholder="Search labels..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <select className="input" value={labelFilter} onChange={e => setLabelFilter(e.target.value)} style={{ width: 130 }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 130 }}>
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="ai_generated">AI Generated</option>
        </select>
      </div>



      {loading ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>No detections found.</p>
      ) : (
        <>
        <div className="glass" style={{ borderRadius: 16, overflow: "hidden", overflowX: "auto" }}>
          <div className="row-grid hist-header" style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} style={{ cursor: "pointer", justifySelf: "center" }} />
            <div style={{ textAlign: "center" }}>Image</div>
            <div style={{ textAlign: "center" }}>Labels</div>
            <div style={{ textAlign: "center" }}>Status</div>
            <div style={{ textAlign: "center" }}>Date</div>
            <div></div>
          </div>

          {paged.map(img => {
            const badge = statusBadge(img.status);
            const date = new Date(img.date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
            return (
              <div key={img._id} className="row-grid hist-row" style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <input type="checkbox" checked={selected.has(img._id)} onChange={() => toggleSelect(img._id)} style={{ cursor: "pointer", justifySelf: "center" }} />
                <img src={img.image_url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", background: "var(--bg)", cursor: "pointer", justifySelf: "center" }} onClick={() => openReview(img._id)} onError={e => e.target.style.opacity = 0.3} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignContent: "center", justifyContent: "center" }}>
                  {(img.labels || []).slice(0, 3).map((l, j) => (
                    <span key={j} style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500, background: "rgba(0,102,204,0.1)", color: "var(--accent)", height: "fit-content" }}>{l}</span>
                  ))}
                  {(img.labels || []).length > 3 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{img.labels.length - 3}</span>}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.c }}>
                    {img.status === "approved" ? "Approved" : img.status === "ai_generated" ? "AI Gen" : "Pending"}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>{date}</span>
                <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <button onClick={() => openReview(img._id)} title="Edit" style={iconBtn("var(--success)")}>
                    <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  <button onClick={() => handleDelete(img._id)} title="Delete" style={iconBtn("var(--danger)")}>
                    <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: 18 }}>close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Show:</label>
            <select className="input" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ width: 90, padding: "6px 10px", fontSize: 13 }}>
              {[50, 100, 200, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{pageStart + 1}-{Math.min(pageStart + perPage, filtered.length)} of {filtered.length}</span>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(1)} disabled={page === 1} style={pgBtn}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pgBtn}>‹</button>
            <span style={{ padding: "6px 12px", fontSize: 13, color: "var(--text)" }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pgBtn}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={pgBtn}>»</button>
          </div>
        </div>
        </>
      )}

      <style>{`
        .row-grid {
          display: grid;
          grid-template-columns: 36px 60px 1fr 100px 80px 80px;
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 700px) {
          .row-grid {
            grid-template-columns: 28px 40px 1fr 70px 55px 60px;
            gap: 4px;
          }
          .row-grid img { width: 36px !important; height: 36px !important; }
          .hist-header { font-size: 9px !important; }
        }
        @media (max-width: 480px) {
          .filter-row { grid-template-columns: 1fr !important; }
          .filter-row > * { width: 100% !important; }
        }
      `}</style>
    </Layout>
  );
}

const iconBtn = (color) => ({
  background: "none", border: "none", cursor: "pointer",
  color: color, padding: 6, borderRadius: 8,
  display: "flex", alignItems: "center", justifyContent: "center",
});

const pgBtn = {
  background: "var(--bg2)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "6px 12px", fontSize: 13,
  color: "var(--text)", cursor: "pointer",
};
