import { useEffect, useState ,useCallback} from "react";
import axios from "../api/axios";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
.dean-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
.dean-inner { max-width: 820px; margin: 0 auto; }
.dean-label { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
.dean-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
.section-head { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,168,90,0.15); }
.req-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 22px 24px; margin-bottom: 14px; }
.req-card.selected { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
.req-info { font-size: 14px; color: rgba(240,236,224,0.7); margin-bottom: 6px; }
.badge-status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; background: rgba(255,180,0,0.12); color: #ffb400; }
.select-btn { padding: 9px 20px; background: #c8a85a; border: none; border-radius: 8px; cursor: pointer; }
.divider { height: 1px; background: rgba(200,168,90,0.12); margin: 32px 0; }
.upload-section { background: #11162a; border-radius: 12px; padding: 28px; }
.file-wrap { border: 1px dashed #c8a85a; padding: 18px; margin-bottom: 20px; }
.submit-btn { padding: 13px 28px; background: #c8a85a; border: none; border-radius: 8px; cursor: pointer; }
.preview-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
.preview-table th { padding: 8px; background: rgba(200,168,90,0.1); color: #c8a85a; }
.preview-table td { padding: 8px; color: rgba(240,236,224,0.7); }
`;

function DeanUploadPage() {
  const [requests, setRequests] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [voters, setVoters] = useState([]);

  // Fetch Requests
  const fetchRequests =useCallback(async () => {
    try {
      const res = await axios.get("/voter/requests");
      const deanRequests = res.data.data.filter(
        (r) => (r.receiver_role_name || "").toLowerCase() === "college_dean"
      );

      setRequests(deanRequests);

      if (deanRequests.length > 0 && !selectedElection) {
        setSelectedElection(deanRequests[0].election_id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch requests");
    }
  },[selectedElection]);

  useEffect(() => {
    fetchRequests();
 }, [fetchRequests]);

  // CSV Parse
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim() !== "");

      if (lines.length < 2) {
        alert("CSV file appears to be empty.");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim());
      const parsed = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || "");
        return obj;
      }).filter(row => row.email && row.email.trim() !== "");

      setVoters(parsed);
    };
    reader.readAsText(file);
  };

  // Submit with election_id
  const handleSubmit = async () => {
    if (!selectedElection) {
      alert("Please select an election");
      return;
    }
    if (voters.length === 0) {
      alert("Upload CSV first");
      return;
    }

    try {
      await axios.post("/dean/upload", {
        election_id: selectedElection,
        voters
      });

      alert(` ${voters.length} voters uploaded successfully for the selected election`);
      setVoters([]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || " Submit failed");
    }
  };

  const selectedTitle = requests.find(r => r.election_id === selectedElection)?.election?.title;

  return (
    <>
      <style>{styles}</style>
      <div className="dean-root">
        <div className="dean-inner">
          <p className="dean-label">College Dean Portal</p>
          <h2 className="dean-title">Upload Voters</h2>

          <div className="section-head">Incoming Requests</div>

          {requests.map((r) => (
            <div
              key={r.id}
              className={`req-card ${r.election_id === selectedElection ? "selected" : ""}`}
            >
              <div className="req-info"><b>ID:</b> {r.election_id}</div>
              <div className="req-info"><b>Election:</b> {r.election?.title}</div>
              <div className="req-info"><b>Description:</b> {r.description}</div>
              <div className="badge-status">{r.status}</div>
              <br />
              <button className="select-btn" onClick={() => setSelectedElection(r.election_id)}>
                Select This Election
              </button>
            </div>
          ))}

          <div className="divider" />

          <div className="upload-section">
            <div className="section-head">Upload CSV</div>

            {selectedTitle && <p>Selected Election: <strong>{selectedTitle}</strong></p>}

            <div className="file-wrap">
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>

            {voters.length > 0 && (
              <>
                <p>✓ {voters.length} rows parsed</p>
                <table className="preview-table">
                  <thead>
                    <tr>
                      {Object.keys(voters[0]).map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {voters.slice(0, 5).map((v, i) => (
                      <tr key={i}>
                        {Object.values(v).map((val, j) => (
                          <td key={j}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <button className="submit-btn" onClick={handleSubmit}>
              Submit Voters to Database →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeanUploadPage;