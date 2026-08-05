import { useEffect, useState } from "react";
import api from "../api/axios";

// ── Score caps per field ───────────────────────────────────────────────────
const FIELD_CONFIG = [
  { key: "educational_level", label: "Educational Level",  max: 35, required: true,  hint: "max 35%"  },
  { key: "work_experience",   label: "Work Experience",    max: 15, required: true,  hint: "max 15%"  },
  { key: "leadership",        label: "Leadership",          max: 10, required: true,  hint: "max 10%"  },
  { key: "work_efficiency",   label: "Work Efficiency",    max: 10, required: true,  hint: "max 10%"  },
  { key: "gender",            label: "Gender Bonus",        max:  5, required: false, hint: "max 5% — optional"  },
  { key: "disability",        label: "Disability Bonus",   max:  5, required: false, hint: "max 5% — optional"  },
];

const CORE_FIELDS   = FIELD_CONFIG.filter((f) => f.required).map((f) => f.key);   // sum → /70
const BONUS_FIELDS  = FIELD_CONFIG.filter((f) => !f.required).map((f) => f.key);  // additive

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .scr-root  { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .scr-inner { max-width: 920px; margin: 0 auto; }
  .scr-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .scr-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }

  /* Application card */
  .app-card       { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 14px; padding: 28px; margin-bottom: 22px; transition: border-color 0.2s; }
  .app-card:hover { border-color: rgba(200,168,90,0.3); }

  /* Header row */
  .app-header    { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px; }
  .app-photo     { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(200,168,90,0.3); flex-shrink: 0; }
  .app-photo-ph  { width: 80px; height: 80px; border-radius: 50%; background: rgba(200,168,90,0.1); border: 2px solid rgba(200,168,90,0.2); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
  .app-name  { font-family: 'Playfair Display', serif; font-size: 20px; color: #f0ece0; margin-bottom: 4px; }
  .app-meta  { font-size: 13px; color: rgba(240,236,224,0.5); margin-bottom: 3px; }

  /* Info grid */
  .info-grid      { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .info-cell      { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; }
  .info-cell-lbl  { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.35); margin-bottom: 4px; }
  .info-cell-val  { font-size: 14px; color: #f0ece0; }

  /* Documents */
  .docs-row  { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
  .doc-link  { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(200,168,90,0.08); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #c8a85a; text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s; cursor: pointer; font-family: inherit; outline: none; }
  .doc-link:hover { background: rgba(200,168,90,0.16); }

  /* Scores section */
  .scores-section { border-top: 1px solid rgba(200,168,90,0.12); padding-top: 20px; }
  .scores-title   { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 18px; }

  /* Two-group layout */
  .scores-group-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.3); margin-bottom: 10px; margin-top: 16px; }
  .scores-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 4px; }
  .scores-grid-3 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .score-field {}
  .score-label { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: rgba(240,236,224,0.5); margin-bottom: 5px; }
  .score-label .hint { font-size: 10px; color: rgba(200,168,90,0.55); font-weight: 500; }

  .score-input { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, border-color 0.2s; box-sizing: border-box; }
  .score-input:focus   { border-color: #c8a85a; }
  .score-input.err     { border-color: rgba(220,80,80,0.7); background: rgba(220,80,80,0.05); }
  .score-input::placeholder { color: rgba(240,236,224,0.18); font-size: 12px; }
  .score-err-text { font-size: 11px; color: #ff8080; margin-top: 4px; }

  /* Total preview */
  .total-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin: 18px 0 16px; }
  .total-box { display: inline-flex; flex-direction: column; padding: 12px 18px; background: rgba(200,168,90,0.08); border: 1px solid rgba(200,168,90,0.2); border-radius: 10px; }
  .total-box-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(200,168,90,0.6); margin-bottom: 4px; }
  .total-box-value { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #c8a85a; line-height: 1; }
  .total-box-sub   { font-size: 11px; color: rgba(240,236,224,0.35); margin-top: 4px; }

  .bonus-box { display: inline-flex; flex-direction: column; padding: 12px 18px; background: rgba(105,185,160,0.07); border: 1px solid rgba(105,185,160,0.2); border-radius: 10px; }
  .bonus-box-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(105,185,160,0.7); margin-bottom: 4px; }
  .bonus-box-value { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #7ee0c4; line-height: 1; }
  .bonus-box-sub   { font-size: 11px; color: rgba(240,236,224,0.35); margin-top: 4px; }

  .grand-box { display: inline-flex; flex-direction: column; padding: 12px 18px; background: rgba(200,168,90,0.14); border: 1.5px solid rgba(200,168,90,0.4); border-radius: 10px; }
  .grand-box-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(200,168,90,0.8); margin-bottom: 4px; }
  .grand-box-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #e0c57a; line-height: 1; }
  .grand-box-sub   { font-size: 11px; color: rgba(240,236,224,0.4); margin-top: 4px; }

  /* Saved result */
  .saved-total { font-size: 13px; color: rgba(240,236,224,0.45); margin-bottom: 14px; }

  /* Submit */
  .btn-submit { padding: 11px 28px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
  .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(200,168,90,0.4); }

  /* Loading / empty */
  .loading-text { text-align: center; padding: 80px 0; color: rgba(240,236,224,0.4); font-size: 16px; }
  .empty-state  { text-align: center; padding: 80px 0; color: rgba(240,236,224,0.3); font-size: 15px; }

  @media (max-width: 640px) {
    .info-grid  { grid-template-columns: 1fr 1fr; }
    .scores-grid, .scores-grid-3 { grid-template-columns: 1fr; }
  }
`;

function Screening() {
  const toViewableUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string" && value.startsWith("data:")) return value;
    return `http://localhost:5000/uploads/${encodeURIComponent(value)}`;
  };

  const handleDownload = async (base64OrUrl, defaultFileName) => {
    if (!base64OrUrl) return;
    
    // If it's a standard URL, open/download it
    if (base64OrUrl.startsWith("http")) {
      const link = document.createElement("a");
      link.href = base64OrUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.setAttribute("download", defaultFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // If it's a data URI base64 string
    try {
      const res = await fetch(base64OrUrl);
      const blob = await res.blob();
      const mime = blob.type || "application/octet-stream";
      const blobUrl = URL.createObjectURL(blob);
      
      // Determine file extension from mime
      let ext = "bin";
      if (mime.includes("wordprocessingml") || mime.includes("officedocument") || mime.includes("msword")) ext = "docx";
      else if (mime.includes("pdf")) ext = "pdf";
      else if (mime.includes("image/png")) ext = "png";
      else if (mime.includes("image/jpeg") || mime.includes("image/jpg")) ext = "jpg";
      
      const cleanName = defaultFileName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${cleanName}.${ext}`;
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download base64 document:", err);
      // Fallback
      const link = document.createElement("a");
      link.href = base64OrUrl;
      link.setAttribute("download", defaultFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const [applications, setApplications] = useState([]);
  const [scores,       setScores]       = useState({});
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [loading,      setLoading]      = useState(true);

  const fetchApplications = async () => {
    try {
      const res  = await api.get("/applications");
      const data = res.data.data || res.data;
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch applications:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, []);

  // ── Handle score change with cap enforcement ──────────────────────────────
  const handleScoreChange = (appId, field, raw) => {
    const cfg     = FIELD_CONFIG.find((f) => f.key === field);
    const numeric = raw === "" ? "" : Number(raw);
    let errMsg    = "";

    if (raw !== "" && !Number.isNaN(numeric)) {
      if (numeric < 0)          errMsg = "Value cannot be negative.";
      else if (numeric > cfg.max) errMsg = `Maximum allowed is ${cfg.max}%.`;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [appId]: { ...(prev[appId] || {}), [field]: errMsg }
    }));

    // Clamp the stored value to the max so submission is always safe
    const stored = raw === "" ? "" : Math.min(Math.max(numeric, 0), cfg.max);

    setScores((prev) => ({
      ...prev,
      [appId]: { ...(prev[appId] || {}), [field]: stored }
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (appId) => {
    const scoreData = scores[appId] || {};

    // Required fields
    const missing = CORE_FIELDS.filter(
      (f) => scoreData[f] === "" || scoreData[f] === null || typeof scoreData[f] === "undefined"
    );
    if (missing.length) {
      alert("Please fill all required score fields (Educational Level, Work Experience, Leadership, Work Efficiency).");
      return;
    }

    // Check any lingering cap errors
    const errs = fieldErrors[appId] || {};
    if (Object.values(errs).some((e) => e)) {
      alert("Please fix the highlighted errors before submitting.");
      return;
    }

    try {
      await api.post(`/screening/${appId}`, scoreData);
      alert("Scores submitted successfully!");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit scores");
    }
  };

  // ── Compute totals ─────────────────────────────────────────────────────────
  const getCoreTotal   = (scoreState) =>
    CORE_FIELDS.reduce((s, f) => s + Number(scoreState[f] || 0), 0);

  const getBonusTotal  = (scoreState) =>
    BONUS_FIELDS.reduce((s, f) => s + Number(scoreState[f] || 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="scr-root"><p className="loading-text">Loading applications…</p></div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="scr-root">
        <div className="scr-inner">
          <p className="scr-badge">Screening</p>
          <h2 className="scr-title">Screen Applications</h2>

          {applications.length === 0 ? (
            <div className="empty-state">No applications found.</div>
          ) : (
            applications.map((app) => {
              const strategicPlan = toViewableUrl(app.strategic_plan_url || app.strategic_plan_file);
              const eduDoc        = toViewableUrl(app.educational_document_url || app.educational_document);
              const workDoc       = toViewableUrl(app.work_efficiency_url || app.documents?.work_efficiency);
              const photoUrl      = toViewableUrl(app.photo_url || app.photo_upload);
              const scoreState    = scores[app.id]      || {};
              const appErrors     = fieldErrors[app.id] || {};
              const existingResult = app.screening_result || null;

              const coreTotal  = getCoreTotal(scoreState);
              const bonusTotal = getBonusTotal(scoreState);
              const grand      = coreTotal + bonusTotal;

              return (
                <div key={app.id} className="app-card">

                  {/* ── Header ── */}
                  <div className="app-header">
                    {photoUrl ? (
                      <img className="app-photo" src={photoUrl} alt="Applicant"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="app-photo-ph">👤</div>
                    )}
                    <div>
                      <div className="app-name">{app.full_name}</div>
                      <div className="app-meta">📧 {app.email}</div>
                      <div className="app-meta">📞 {app.phone_number}</div>
                      <div className="app-meta">🏛 {app.vacancy?.position_name} — {app.vacancy?.campus}</div>
                    </div>
                  </div>

                  {/* ── Info grid ── */}
                  <div className="info-grid">
                    <div className="info-cell">
                      <div className="info-cell-lbl">Education</div>
                      <div className="info-cell-val">{app.documents?.educational_level || "N/A"}</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-cell-lbl">Gender</div>
                      <div className="info-cell-val">{app.gender || "N/A"}</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-cell-lbl">Disability</div>
                      <div className="info-cell-val">{app.disability || "N/A"}</div>
                    </div>
                  </div>

                  {/* ── Documents ── */}
                  <div className="docs-row">
                    {strategicPlan && (
                      <button 
                        type="button"
                        className="doc-link" 
                        onClick={() => handleDownload(strategicPlan, `Strategic_Plan_${app.full_name}`)}
                      >
                         Strategic Plan
                      </button>
                    )}
                    {eduDoc && (
                      <button 
                        type="button"
                        className="doc-link" 
                        onClick={() => handleDownload(eduDoc, `Educational_Doc_${app.full_name}`)}
                      >
                        🎓 Educational Doc
                      </button>
                    )}
                    {workDoc && (
                      <button 
                        type="button"
                        className="doc-link" 
                        onClick={() => handleDownload(workDoc, `Work_Efficiency_${app.full_name}`)}
                      >
                        Work Efficiency
                      </button>
                    )}
                    {!strategicPlan && !eduDoc && !workDoc &&
                      <span style={{ color: "rgba(240,236,224,0.3)", fontSize: 13 }}>No documents uploaded</span>}
                  </div>

                  {/* ── Scores Section ── */}
                  <div className="scores-section">
                    <div className="scores-title">Evaluation Scores</div>

                    {/* Core 4 fields — total /70 */}
                    <div className="scores-group-label">Core Criteria (max 70%)</div>
                    <div className="scores-grid">
                      {FIELD_CONFIG.filter((f) => f.required).map(({ key, label, hint }) => (
                        <div key={key} className="score-field">
                          <div className="score-label">
                            <span>{label}</span>
                            <span className="hint">{hint}</span>
                          </div>
                          <input
                            className={`score-input${appErrors[key] ? " err" : ""}`}
                            type="number"
                            min="0"
                            max={FIELD_CONFIG.find((f) => f.key === key).max}
                            step="0.1"
                            placeholder="0"
                            value={scoreState[key] ?? ""}
                            onChange={(e) => handleScoreChange(app.id, key, e.target.value)}
                          />
                          {appErrors[key] && <div className="score-err-text">⚠ {appErrors[key]}</div>}
                        </div>
                      ))}
                    </div>

                    {/* Bonus fields — gender + disability */}
                    <div className="scores-group-label" style={{ marginTop: 20 }}>Bonus Criteria (optional, max 5% each)</div>
                    <div className="scores-grid-3">
                      {FIELD_CONFIG.filter((f) => !f.required).map(({ key, label, hint }) => (
                        <div key={key} className="score-field">
                          <div className="score-label">
                            <span>{label}</span>
                            <span className="hint">{hint}</span>
                          </div>
                          <input
                            className={`score-input${appErrors[key] ? " err" : ""}`}
                            type="number"
                            min="0"
                            max={FIELD_CONFIG.find((f) => f.key === key).max}
                            step="0.1"
                            placeholder="0 (optional)"
                            value={scoreState[key] ?? ""}
                            onChange={(e) => handleScoreChange(app.id, key, e.target.value)}
                          />
                          {appErrors[key] && <div className="score-err-text">⚠ {appErrors[key]}</div>}
                        </div>
                      ))}
                    </div>

                    {/* Total preview */}
                    <div className="total-row">
                      <div className="total-box">
                        <div className="total-box-label">Core Score</div>
                        <div className="total-box-value">{coreTotal.toFixed(1)}</div>
                        <div className="total-box-sub">out of 70%</div>
                      </div>

                      {bonusTotal > 0 && (
                        <div className="bonus-box">
                          <div className="bonus-box-label">Bonus</div>
                          <div className="bonus-box-value">+{bonusTotal.toFixed(1)}</div>
                          <div className="bonus-box-sub">gender / disability</div>
                        </div>
                      )}

                      <div className="grand-box">
                        <div className="grand-box-label">Grand Total</div>
                      <div className="grand-box-value">{grand.toFixed(1)}%</div>
                      <div className="grand-box-sub">out of {70 + bonusTotal.toFixed(1)}%</div>
                     </div>
                    </div>

                    {existingResult && (
                      <div className="saved-total">
                        Saved Total: <strong>{existingResult.total_score}</strong>
                      </div>
                    )}

                    <button className="btn-submit" onClick={() => handleSubmit(app.id)}>
                      Submit Scores →
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default Screening;