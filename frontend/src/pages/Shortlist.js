import { useEffect, useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .sl-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .sl-inner { max-width: 900px; margin: 0 auto; }
  .sl-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .sl-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 20px; }
  .sl-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 24px; margin-bottom: 14px; display: flex; align-items: center; gap: 20px; transition: border-color 0.2s; }
  .sl-card:hover { border-color: rgba(200,168,90,0.3); }
  .sl-card-top { border-color: rgba(200,168,90,0.4); background: linear-gradient(135deg, rgba(200,168,90,0.08), #11162a); }
  .sl-rank { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; background: rgba(200,168,90,0.12); color: #c8a85a; border: 1px solid rgba(200,168,90,0.25); }
  .sl-rank-top { background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border: none; }
  .sl-info { flex: 1; }
  .sl-name { font-family: 'Playfair Display', serif; font-size: 18px; color: #f0ece0; margin-bottom: 4px; }
  .sl-email { font-size: 13px; color: rgba(240,236,224,0.45); margin-bottom: 8px; }
  .sl-score { font-size: 13px; color: rgba(240,236,224,0.6); }
  .sl-score b { color: #c8a85a; font-size: 16px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  .badge-pending  { background: rgba(255,180,0,0.12); color: #ffb400; border: 1px solid rgba(255,180,0,0.25); }
  .badge-approved { background: rgba(50,200,100,0.12); color: #5ddc8a; border: 1px solid rgba(50,200,100,0.25); }
  .badge-rejected { background: rgba(220,50,50,0.12); color: #ff7070; border: 1px solid rgba(220,50,50,0.25); }
  .sl-actions { display: flex; gap: 10px; flex-direction: column; }
  .btn-approve { padding: 9px 18px; background: rgba(50,200,100,0.12); color: #5ddc8a; border: 1px solid rgba(50,200,100,0.25); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .btn-approve:hover:not(:disabled) { background: rgba(50,200,100,0.22); }
  .btn-reject { padding: 9px 18px; background: rgba(220,50,50,0.1); color: #ff7070; border: 1px solid rgba(220,50,50,0.2); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .btn-reject:hover:not(:disabled) { background: rgba(220,50,50,0.2); }
  .btn-approve:disabled, .btn-reject:disabled { opacity: 0.3; cursor: not-allowed; }
  .empty-state { text-align: center; padding: 80px 0; color: rgba(240,236,224,0.3); font-size: 15px; }
  .generate-btn { 
    padding: 12px 24px; 
    background: #c8a85a; 
    color: #0a0e1a; 
    font-weight: 600; 
    border: none; 
    border-radius: 8px; 
    cursor: pointer; 
    font-size: 15px;
    margin-top: 12px;
    width: 100%;
  }
  .generate-btn:hover { background: #e0c57a; }
`;

function Shortlist() {
  const [applications, setApplications] = useState([]);

  const fetchData = async () => {
    try {
      const appRes = await axios.get("/applications");
      const applicationsData = appRes.data.data || appRes.data || [];

      const merged = applicationsData.map((app) => ({
        id: app.id,
        full_name: app.full_name,
        email: app.email,
        vacancy_id: app.vacancy_id,        // ← This is your election identifier
        status: app.status || "pending",
        raw: app
      }));

      console.log("Loaded applications:", merged);
      setApplications(merged);
    } catch (err) {
      console.error("Fetch error:", err);
      setApplications([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this candidate?")) return;
    try {
      await axios.post(`/candidates/approve/${id}`);
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
      alert("Candidate approved + email sent");
    } catch { alert("Approval failed"); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this candidate?")) return;
    try {
      await axios.post(`/candidates/reject/${id}`);
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));
      alert("Candidate rejected + email sent");
    } catch { alert("Rejection failed"); }
  };

  const getBadge = (s) => s === "approved" ? "badge-approved" : s === "rejected" ? "badge-rejected" : "badge-pending";

  return (
    <>
      <style>{styles}</style>
      <div className="sl-root">
        <div className="sl-inner">
          <p className="sl-badge">🏆 Shortlisting</p>
          <h2 className="sl-title">Scored Applicants</h2>

          {applications.length === 0 ? (
            <div className="empty-state">No screened applicants found.</div>
          ) : (
            applications.map((a, index) => (
              <div key={a.id} className={`sl-card ${index === 0 ? "sl-card-top" : ""}`}>
                <div className={`sl-rank ${index === 0 ? "sl-rank-top" : ""}`}>#{index + 1}</div>
                <div className="sl-info">
                  <div className="sl-name">{a.full_name}</div>
                  <div className="sl-email">{a.email}</div>
                  {a.vacancy_id && <div style={{fontSize: "13px", color: "#c8a85a", marginTop: "4px"}}>
                    Vacancy ID: {a.vacancy_id}
                  </div>}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                  <span className={`badge ${getBadge(a.status)}`}>{a.status}</span>
                  <div className="sl-actions">
                    <button className="btn-approve" disabled={a.status !== "pending"} onClick={() => handleApprove(a.id)}>✓ Approve</button>
                    <button className="btn-reject" disabled={a.status !== "pending"} onClick={() => handleReject(a.id)}>✕ Reject</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Shortlist;

