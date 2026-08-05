
import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .cp-root { min-height: 100vh; background: #0a0e1a; display: flex; align-items: center; justify-content: center; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .cp-card { width: 100%; max-width: 520px; background: #11162a; border: 1px solid rgba(200,168,90,0.2); border-radius: 16px; padding: 44px; box-shadow: 0 24px 60px rgba(0,0,0,0.4); }
  .cp-icon { font-size: 36px; margin-bottom: 16px; }
  .cp-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #f0ece0; margin-bottom: 6px; }
  .cp-sub { font-size: 14px; color: rgba(240,236,224,0.4); margin-bottom: 32px; }
  .cp-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 8px; }
  .cp-textarea { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 10px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; resize: vertical; transition: border-color 0.2s, background 0.2s; margin-bottom: 24px; line-height: 1.6; }
  .cp-textarea:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .cp-textarea::placeholder { color: rgba(240,236,224,0.2); }
  .cp-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.25s; }
  .cp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,168,90,0.4); }
`;

function ComplaintPage() {
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post("/complaints", { application_id: id, message });
      alert("Complaint submitted");
    } catch {
      alert("Error submitting complaint");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="cp-root">
        <div className="cp-card">
          <h2 className="cp-title">Submit a Complaint</h2>
          <p className="cp-sub">Provide details about your concern below</p>
          <label className="cp-label">Complaint Details</label>
          <textarea
            className="cp-textarea"
            placeholder="Explain your complaint in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
          />
          <button className="cp-btn" onClick={handleSubmit}>Submit Complaint →</button>
        </div>
      </div>
    </>
  );
}

export default ComplaintPage;