import { useEffect, useState } from "react";
import axios from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .hr-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .hr-inner { max-width: 820px; margin: 0 auto; }
  .hr-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .hr-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  .section-head { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,168,90,0.15); }
  .req-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 22px 24px; margin-bottom: 14px; transition: border-color 0.2s; }
  .req-card:hover { border-color: rgba(200,168,90,0.3); }
  .req-card.selected { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .req-info { font-size: 14px; color: rgba(240,236,224,0.7); margin-bottom: 6px; }
  .req-info b { color: #f0ece0; }
  .badge-status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; background: rgba(255,180,0,0.12); color: #ffb400; border: 1px solid rgba(255,180,0,0.25); margin-bottom: 14px; }
  .select-btn { padding: 9px 20px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .select-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(200,168,90,0.35); }
  .divider { height: 1px; background: rgba(200,168,90,0.12); margin: 32px 0; }
  .upload-section { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 28px; }
  .selected-tag { display: inline-block; padding: 6px 14px; background: rgba(200,168,90,0.1); border: 1px solid rgba(200,168,90,0.3); border-radius: 20px; font-size: 13px; color: #c8a85a; margin-bottom: 20px; }
  .file-wrap { border: 1.5px dashed rgba(200,168,90,0.25); border-radius: 8px; padding: 18px; margin-bottom: 20px; background: rgba(200,168,90,0.03); transition: border-color 0.2s; }
  .file-wrap:hover { border-color: rgba(200,168,90,0.5); }
  .file-wrap input[type="file"] { width: 100%; color: rgba(240,236,224,0.5); font-size: 14px; }
  .submit-btn { padding: 13px 28px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,168,90,0.4); }
  .empty-state { text-align: center; padding: 40px; color: rgba(240,236,224,0.3); font-size: 14px; }
  .preview-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
  .preview-table th { text-align: left; padding: 8px 12px; background: rgba(200,168,90,0.1); color: #c8a85a; font-weight: 500; border-bottom: 1px solid rgba(200,168,90,0.2); }
  .preview-table td { padding: 8px 12px; color: rgba(240,236,224,0.7); border-bottom: 1px solid rgba(255,255,255,0.04); }
  .preview-table tr:last-child td { border-bottom: none; }
`;

function HRUploadPage() {
  const [requests, setRequests] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHR, setIsHR] = useState(false);

  const fetchCurrentUser =useCallback( async () => {
    try {
      const res = await axios.get("/auth/me");
      const user = res.data.data;
      setCurrentUser(user);

      const role = (user.role || "").toString().toLowerCase().trim();
      const hasHrAccess = ["hr", "hr officer", "system administrator"].includes(role);
      setIsHR(hasHrAccess);

      if (!hasHrAccess) {
        alert("Access denied: you must be an HR user to upload employee CSV files.");
        return;
      }

      await fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to verify user role. Please log in again.");
    }
  },[]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/voter/requests");
      const hrRequests = res.data.data.filter((r) => {
        const roleName = (r.receiver_role_name || r.receiverRole?.role_name || "").toString().toLowerCase();
        return roleName === "hr";
      });
      setRequests(hrRequests);
      if (hrRequests.length > 0) setSelectedElection(hrRequests[0].election_id);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch HR requests");
    }
  };

  useEffect(() => { fetchCurrentUser(); },  [fetchCurrentUser]);

  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;

      // Remove carriage returns (\r), split into lines, drop blank lines
      const lines = text
        .replace(/\r/g, "")
        .split("\n")
        .filter((l) => l.trim() !== "");

      if (lines.length < 2) {
        alert("CSV file appears to be empty or has no data rows.");
        return;
      }

   
      const headers = lines[0].split(",").map((h) => h.trim());

      const parsed = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());

        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || "";
        });

        return obj;
      // Keep only rows that have a non-empty email
      }).filter((row) => row.email && row.email.trim() !== "");

      if (parsed.length === 0) {
        alert("No valid rows found. Make sure your CSV has an 'email' column.");
        return;
      }

      setEmployees(parsed);
    };

    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!isHR) {
      alert("Access denied: only HR users can upload employee files.");
      return;
    }
    if (employees.length === 0) {
      alert("Please select a CSV file with employees before uploading.");
      return;
    }

    try {
      await axios.post("/hr/upload", { employees });
      alert(` ${employees.length} employees uploaded successfully!`);
      setEmployees([]);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Upload failed. Check the server logs.";
      alert(`❌ ${msg}`);
    }
  };

  const selectedTitle = requests.find((r) => r.election_id === selectedElection)?.election?.title;

  if (currentUser && !isHR) {
    return (
      <>
        <style>{styles}</style>
        <div className="hr-root">
          <div className="hr-inner">
            <p className="hr-badge">Access Denied</p>
            <h2 className="hr-title">HR Access Required</h2>
            <div className="empty-state">You do not have the HR role required to upload employee CSV files.</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="hr-root">
        <div className="hr-inner">
          <p className="hr-badge">🏢 HR Officer Portal</p>
          <h2 className="hr-title">Upload Employees</h2>

          <div className="section-head">Incoming Requests</div>

          {requests.length === 0 ? (
            <div className="empty-state">No incoming HR requests found.</div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className={`req-card ${r.election_id === selectedElection ? "selected" : ""}`}>
                <div className="req-info"><b>Election ID:</b> {r.election_id}</div>
                <div className="req-info"><b>Election:</b> {r.election?.title || "Unknown"}</div>
                <div className="req-info"><b>Description:</b> {r.description || "No description"}</div>
                <div className="req-info"><b> Period:</b> {r.election?.start_date || "N/A"} → {r.election?.end_date || "N/A"}</div>
                <div className="badge-status">{r.status}</div><br />
                <button className="select-btn" onClick={() => setSelectedElection(r.election_id)}>Select Election</button>
              </div>
            ))
          )}

          <div className="divider" />

          <div className="upload-section">
            <div className="section-head">Upload Employee CSV</div>
            {selectedTitle && <div className="selected-tag">{selectedTitle}</div>}

            <div className="file-wrap">
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>

            {/* Preview table so user can confirm data looks correct before submitting */}
            {employees.length > 0 && (
              <>
                <p style={{ fontSize: "13px", color: "rgba(240,236,224,0.5)", marginBottom: "12px" }}>
                  ✓ {employees.length} employee{employees.length !== 1 ? "s" : ""} parsed — preview:
                </p>
                <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {Object.keys(employees[0]).map((h) => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {employees.slice(0, 5).map((emp, i) => (
                        <tr key={i}>
                          {Object.values(emp).map((v, j) => <td key={j}>{v || "—"}</td>)}
                        </tr>
                      ))}
                      {employees.length > 5 && (
                        <tr>
                          <td
                            colSpan={Object.keys(employees[0]).length}
                            style={{ color: "rgba(240,236,224,0.3)", fontStyle: "italic" }}
                          >
                            ...and {employees.length - 5} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <button className="submit-btn" onClick={handleSubmit}>Upload Employees →</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HRUploadPage;