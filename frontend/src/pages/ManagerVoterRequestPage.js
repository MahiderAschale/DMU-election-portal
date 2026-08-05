
import { useEffect, useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .mvr-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .mvr-inner { max-width: 560px; margin: 0 auto; }
  .mvr-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .mvr-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  .mvr-card { background: #11162a; border: 1px solid rgba(200,168,90,0.2); border-radius: 14px; padding: 36px; }
  .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 7px; }
  .field-select { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; margin-bottom: 20px; }
  .field-select:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .field-select option { background: #11162a; }
  .field-textarea { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; margin-bottom: 24px; resize: vertical; line-height: 1.6; }
  .field-textarea:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .field-textarea::placeholder { color: rgba(240,236,224,0.2); }
  .send-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.25s; }
  .send-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,168,90,0.4); }
`;

function ManagerVoterRequestPage() {
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({ election_id: "", receiver_role: "college_dean", description: "" });

  const fetchElections = async () => {
    const res = await axios.get("/elections");
    setElections(res.data.data || []);
  };

  useEffect(() => { fetchElections(); }, []);

  const handleSubmit = async () => {
    try {
      await axios.post("/voter/request", form);
      alert(" Request sent successfully");
      setForm({ election_id: "", receiver_role: "college_dean", description: "" });
    } catch (err) { console.error(err); alert("❌ Failed to send request"); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="mvr-root">
        <div className="mvr-inner">
          <p className="mvr-badge"> Election Manager</p>
          <h2 className="mvr-title">Send Voter Request</h2>
          <div className="mvr-card">
            <label className="field-label">Select Election</label>
            <select className="field-select" value={form.election_id} onChange={(e) => setForm({ ...form, election_id: e.target.value })}>
              <option value="">Choose an election...</option>
              {elections.map((e) => (<option key={e.id} value={e.id}>{e.title}</option>))}
            </select>

            <label className="field-label">Send Request To</label>
            <select className="field-select" value={form.receiver_role} onChange={(e) => setForm({ ...form, receiver_role: e.target.value })}>
              <option value="college_dean">College Dean</option>
              <option value="hr">HR Officer</option>
            </select>

            <label className="field-label">Request Description</label>
            <textarea
              className="field-textarea"
              placeholder="Describe the request and any relevant details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
            />

            <button className="send-btn" onClick={handleSubmit}>Send Request →</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManagerVoterRequestPage;