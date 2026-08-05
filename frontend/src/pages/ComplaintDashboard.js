
import { useEffect, useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .cmp-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .cmp-inner { max-width: 820px; margin: 0 auto; }
  .cmp-label { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .cmp-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  .cmp-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 24px; margin-bottom: 16px; transition: border-color 0.2s; }
  .cmp-card:hover { border-color: rgba(200,168,90,0.3); }
  .cmp-card-name { font-family: 'Playfair Display', serif; font-size: 18px; color: #f0ece0; margin-bottom: 4px; }
  .cmp-card-email { font-size: 13px; color: rgba(240,236,224,0.4); margin-bottom: 12px; }
  .cmp-message { font-size: 14px; color: rgba(240,236,224,0.7); line-height: 1.6; margin-bottom: 14px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid rgba(200,168,90,0.3); }
  .cmp-meta { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  .badge-pending  { background: rgba(255,180,0,0.12); color: #ffb400; border: 1px solid rgba(255,180,0,0.25); }
  .badge-approved { background: rgba(50,200,100,0.12); color: #5ddc8a; border: 1px solid rgba(50,200,100,0.25); }
  .badge-rejected { background: rgba(220,50,50,0.12); color: #ff7070; border: 1px solid rgba(220,50,50,0.25); }
  .cmp-reason { font-size: 13px; color: rgba(240,236,224,0.5); margin-bottom: 16px; padding: 10px 14px; background: rgba(220,50,50,0.06); border-radius: 8px; border: 1px solid rgba(220,50,50,0.15); }
  .cmp-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .btn-approve { padding: 9px 20px; background: rgba(50,200,100,0.12); color: #5ddc8a; border: 1px solid rgba(50,200,100,0.25); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-approve:hover:not(:disabled) { background: rgba(50,200,100,0.22); transform: translateY(-1px); }
  .btn-reject { padding: 9px 20px; background: rgba(220,50,50,0.12); color: #ff7070; border: 1px solid rgba(220,50,50,0.25); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-reject:hover:not(:disabled) { background: rgba(220,50,50,0.22); transform: translateY(-1px); }
  .btn-approve:disabled, .btn-reject:disabled { opacity: 0.35; cursor: not-allowed; }
  .reason-input { flex: 1; min-width: 180px; padding: 9px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; }
  .reason-input:focus { border-color: #c8a85a; }
  .reason-input::placeholder { color: rgba(240,236,224,0.2); }
  .cmp-empty { text-align: center; padding: 80px 0; color: rgba(240,236,224,0.3); font-size: 15px; }
`;

function ComplaintDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [reasonMap, setReasonMap] = useState({});

  const fetchComplaints = async () => {
    try { const res = await axios.get("/complaints"); setComplaints(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this complaint?")) return;
    try { await axios.put(`/complaints/approve/${id}`); alert("Complaint approved + email sent"); fetchComplaints(); }
    catch { alert("Failed to approve"); }
  };

  const handleReject = async (id) => {
    const reason = reasonMap[id];
    if (!reason) return alert("Enter rejection reason");
    if (!window.confirm("Reject this complaint?")) return;
    try { await axios.put(`/complaints/reject/${id}`, { reason }); alert("Complaint rejected + email sent"); fetchComplaints(); }
    catch { alert("Failed to reject"); }
  };

  const getBadgeClass = (s) => s === "approved" ? "badge-approved" : s === "rejected" ? "badge-rejected" : "badge-pending";

  return (
    <>
      <style>{styles}</style>
      <div className="cmp-root">
        <div className="cmp-inner">
          <p className="cmp-label"> Admin Panel</p>
          <h2 className="cmp-title">Complaint Dashboard</h2>

          {complaints.length === 0 ? (
            <div className="cmp-empty">No complaints found.</div>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className="cmp-card">
                <div className="cmp-card-name">{c.application?.full_name}</div>
                <div className="cmp-card-email">{c.application?.email}</div>
                <div className="cmp-message">{c.message}</div>
                <div className="cmp-meta">
                  <span className={`badge ${getBadgeClass(c.status)}`}>{c.status}</span>
                </div>
                {c.review_reason && <div className="cmp-reason">📋 Reason: {c.review_reason}</div>}
                <div className="cmp-actions">
                  <button className="btn-approve" disabled={c.status !== "pending"} onClick={() => handleApprove(c.id)}>✓ Approve</button>
                  <input
                    className="reason-input"
                    placeholder="Enter rejection reason..."
                    value={reasonMap[c.id] || ""}
                    onChange={(e) => setReasonMap({ ...reasonMap, [c.id]: e.target.value })}
                  />
                  <button className="btn-reject" disabled={c.status !== "pending"} onClick={() => handleReject(c.id)}>✕ Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default ComplaintDashboard;