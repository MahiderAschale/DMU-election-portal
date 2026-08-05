import { useEffect, useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .mar-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .mar-inner { max-width: 760px; margin: 0 auto; }
  .mar-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .mar-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  .req-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 24px; margin-bottom: 16px; transition: border-color 0.2s; }
  .req-card:hover { border-color: rgba(200,168,90,0.3); }
  .req-info { font-size: 14px; color: rgba(240,236,224,0.7); margin-bottom: 8px; }
  .req-info b { color: #f0ece0; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 16px; }
  .badge-pending  { background: rgba(255,180,0,0.12); color: #ffb400; border: 1px solid rgba(255,180,0,0.25); }
  .badge-approved { background: rgba(50,200,100,0.12); color: #5ddc8a; border: 1px solid rgba(50,200,100,0.25); }
  .btn-approve { padding: 10px 22px; background: rgba(50,200,100,0.12); color: #5ddc8a; border: 1px solid rgba(50,200,100,0.25); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-approve:hover { background: rgba(50,200,100,0.22); transform: translateY(-1px); }
  .empty-state { text-align: center; padding: 60px 0; color: rgba(240,236,224,0.3); font-size: 15px; }
`;

function ManagerApproveRequestPage() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try { const res = await axios.get("/voter-requests"); setRequests(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const approve = async (id) => {
    try { await axios.put(`/voter/approve/${id}`); alert("Approved"); fetchRequests(); }
    catch (err) { console.error(err); alert("Failed"); }
  };

  const getBadge = (s) => s === "approved" ? "badge-approved" : "badge-pending";

  return (
    <>
      <style>{styles}</style>
      <div className="mar-root">
        <div className="mar-inner">
          <p className="mar-badge">Election Manager</p>
          <h2 className="mar-title">Approve Voter Requests</h2>
          {requests.length === 0 ? (
            <div className="empty-state">No voter requests pending.</div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="req-card">
                <div className="req-info"><b>Election ID:</b> {r.election_id}</div>
                <div className="req-info"><b>Role:</b> {r.receiver_role}</div>
                <span className={`badge ${getBadge(r.status)}`}>{r.status}</span>
                <br />
                <button className="btn-approve" onClick={() => approve(r.id)}>✓ Approve</button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default ManagerApproveRequestPage;