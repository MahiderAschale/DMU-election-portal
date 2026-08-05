import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .rl-root { min-height: 100vh; background: #0a0e1a; padding: 40px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .rl-inner { max-width: 860px; margin: 0 auto; }
  .rl-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 10px; }
  .rl-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f0ece0; margin-bottom: 6px; }
  .rl-subtitle { font-size: 13px; color: rgba(240,236,224,0.4); margin-bottom: 32px; }

  .rl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  .rl-card {
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.15);
    border-radius: 14px;
    padding: 22px;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.18s, box-shadow 0.2s;
    display: flex; flex-direction: column; gap: 10px;
  }
  .rl-card:hover {
    border-color: rgba(200,168,90,0.5);
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  }

  .rl-card-title { font-family: 'Playfair Display', serif; font-size: 17px; color: #f0ece0; }
  .rl-card-position { font-size: 12px; color: #c8a85a; font-weight: 500; }
  .rl-card-dates { font-size: 11px; color: rgba(240,236,224,0.35); }

  .rl-status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .rl-status-voting   { background: rgba(105,185,160,0.15); color: #7ee0c4; border: 1px solid rgba(105,185,160,0.25); }
  .rl-status-finalized{ background: rgba(200,168,90,0.15);  color: #c8a85a; border: 1px solid rgba(200,168,90,0.25); }
  .rl-status-other    { background: rgba(255,255,255,0.05); color: rgba(240,236,224,0.45); border: 1px solid rgba(255,255,255,0.08); }

  .rl-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
  .rl-view-btn { font-size: 12px; font-weight: 600; color: #c8a85a; background: rgba(200,168,90,0.1); border: 1px solid rgba(200,168,90,0.25); border-radius: 6px; padding: 5px 14px; }

  .rl-empty { text-align: center; padding: 60px 20px; color: rgba(240,236,224,0.3); font-size: 14px; }
  .rl-loading { color: rgba(240,236,224,0.35); font-size: 14px; padding: 40px 0; text-align: center; }
  .rl-error { color: #ff9a9a; background: rgba(220,50,50,0.1); border: 1px solid rgba(220,50,50,0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; }

  @media (max-width: 600px) { .rl-root { padding: 24px 14px; } .rl-grid { grid-template-columns: 1fr; } }
`;

function ResultsLandingPage() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [eRes, pRes] = await Promise.all([
          axios.get("/elections"),
          axios.get("/positions")
        ]);
        setElections(eRes.data?.data || []);
        setPositions(pRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load elections.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getPosition = (election) =>
    positions.find((p) => Number(p.id) === Number(election.position_id))?.position_name || "—";

  const getStatus = (election) => {
    if (election.is_finalized) return { label: "🏁 Finalized", cls: "rl-status-finalized" };
    if (election.status === "voting_open") return { label: "🗳 Voting Open", cls: "rl-status-voting" };
    return { label: election.status || "Pending", cls: "rl-status-other" };
  };

  return (
    <>
      <style>{css}</style>
      <div className="rl-root">
        <div className="rl-inner">
          <p className="rl-badge">Election Manager · Results</p>
          <h2 className="rl-title"> Election Results</h2>
          <p className="rl-subtitle">
            Select an election below to view live vote counts and results.
          </p>

          {error && <div className="rl-error">⚠ {error}</div>}

          {loading ? (
            <p className="rl-loading">Loading elections…</p>
          ) : elections.length === 0 ? (
            <div className="rl-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗳</div>
              <p>No elections found. Create one from the Elections page first.</p>
            </div>
          ) : (
            <div className="rl-grid">
              {elections.map((election) => {
                const { label, cls } = getStatus(election);
                return (
                  <div
                    key={election.id}
                    className="rl-card"
                    onClick={() => navigate(`/results/${election.id}`)}
                  >
                    <div className="rl-card-title">{election.title}</div>
                    <div className="rl-card-position">{getPosition(election)}</div>
                    <div className="rl-card-dates">
                      {election.start_date} → {election.end_date}
                    </div>
                    <div className="rl-card-footer">
                      <span className={`rl-status ${cls}`}>{label}</span>
                      <span className="rl-view-btn">View Results →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ResultsLandingPage;
