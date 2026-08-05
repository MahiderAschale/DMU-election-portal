import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .rp-root { min-height: 100vh; background: #0a0e1a; padding: 40px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .rp-inner { max-width: 860px; margin: 0 auto; }
  .rp-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 10px; }
  .rp-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #f0ece0; margin-bottom: 4px; }
  .rp-subtitle { font-size: 13px; color: rgba(240,236,224,0.4); margin-bottom: 28px; }

  /* Header bar */
  .rp-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; }
  .rp-back-btn { border: 1px solid rgba(200,168,90,0.3); border-radius: 8px; padding: 8px 18px; background: transparent; color: #c8a85a; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .rp-back-btn:hover { background: rgba(200,168,90,0.1); }

  /* Stat cards */
  .rp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
  .rp-stat { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 10px; padding: 16px; }
  .rp-stat-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.35); margin-bottom: 6px; }
  .rp-stat-value { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #f0ece0; }
  .rp-stat-sub { font-size: 11px; color: rgba(240,236,224,0.3); margin-top: 2px; }

  /* Status badges */
  .rp-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
  .rp-status-voting { background: rgba(105,185,160,0.15); color: #7ee0c4; border: 1px solid rgba(105,185,160,0.25); }
  .rp-status-finalized { background: rgba(200,168,90,0.15); color: #c8a85a; border: 1px solid rgba(200,168,90,0.25); }
  .rp-status-other { background: rgba(255,255,255,0.05); color: rgba(240,236,224,0.5); border: 1px solid rgba(255,255,255,0.08); }

  /* Candidate result rows */
  .rp-list { display: flex; flex-direction: column; gap: 14px; }
  .rp-row { background: #11162a; border: 1px solid rgba(200,168,90,0.12); border-radius: 14px; padding: 18px 20px; transition: border-color 0.2s, transform 0.15s; }
  .rp-row:hover { border-color: rgba(200,168,90,0.3); transform: translateX(3px); }
  .rp-row.winner { border-color: rgba(200,168,90,0.6); background: linear-gradient(135deg, rgba(200,168,90,0.07), rgba(200,168,90,0.02)); }

  .rp-row-top { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
  .rp-rank { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: rgba(200,168,90,0.4); min-width: 28px; text-align: center; }
  .rp-rank.gold { color: #c8a85a; }
  .rp-photo { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
  .rp-initials { width: 52px; height: 52px; border-radius: 10px; background: linear-gradient(135deg, #c8a85a22, #c8a85a11); border: 1px solid rgba(200,168,90,0.2); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 22px; color: #c8a85a; flex-shrink: 0; }
  .rp-info { flex: 1; min-width: 0; }
  .rp-name { font-size: 15px; font-weight: 600; color: #f0ece0; margin-bottom: 2px; }
  .rp-position { font-size: 12px; color: rgba(200,168,90,0.8); }
  .rp-vote-count { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #f0ece0; text-align: right; }
  .rp-vote-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: rgba(240,236,224,0.3); text-align: right; }
  .rp-winner-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: linear-gradient(135deg, rgba(200,168,90,0.3), rgba(200,168,90,0.15)); color: #e0c57a; border: 1px solid rgba(200,168,90,0.4); margin-left: 8px; }

  /* Progress bar */
  .rp-bar-wrap { background: rgba(255,255,255,0.04); border-radius: 6px; height: 8px; overflow: hidden; margin-bottom: 6px; }
  .rp-bar { height: 100%; border-radius: 6px; transition: width 0.6s ease; background: linear-gradient(90deg, #c8a85a, #e0c57a); }
  .rp-bar.winner-bar { background: linear-gradient(90deg, #c8a85a, #f0d090); box-shadow: 0 0 8px rgba(200,168,90,0.4); }

  /* Score row */
  .rp-scores { display: flex; gap: 20px; flex-wrap: wrap; }
  .rp-score-item { font-size: 12px; color: rgba(240,236,224,0.45); }
  .rp-score-item strong { color: #f0ece0; margin-left: 4px; }
  .rp-score-item .converted { color: #c8a85a; }

  /* Controls */
  .rp-controls { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; align-items: center; }
  .rp-btn { border: none; border-radius: 8px; padding: 9px 18px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .rp-btn-gold { background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; }
  .rp-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(200,168,90,0.35); }
  .rp-btn-gold:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
  .rp-btn-ghost { background: rgba(255,255,255,0.05); color: rgba(240,236,224,0.6); border: 1px solid rgba(255,255,255,0.1); }
  .rp-btn-ghost:hover { background: rgba(255,255,255,0.09); }
  .rp-auto-label { font-size: 12px; color: rgba(240,236,224,0.3); margin-left: 4px; }

  /* Live pulse dot */
  .rp-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #5ddc8a; display: inline-block; margin-right: 6px; animation: pulse 1.4s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  /* Empty / loading / error */
  .rp-empty { text-align: center; padding: 60px 20px; color: rgba(240,236,224,0.3); font-size: 14px; }
  .rp-loading { color: rgba(240,236,224,0.35); font-size: 14px; padding: 40px 0; text-align: center; }
  .rp-error { color: #ff9a9a; background: rgba(220,50,50,0.1); border: 1px solid rgba(220,50,50,0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; }
  .rp-success { color: #7ee0c4; background: rgba(105,185,160,0.1); border: 1px solid rgba(105,185,160,0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; }

  .rp-divider { border: none; border-top: 1px solid rgba(200,168,90,0.1); margin: 24px 0; }
  @media (max-width: 600px) { .rp-root { padding: 24px 14px; } .rp-title { font-size: 22px; } .rp-row-top { gap: 10px; } }
`;

function ResultsPage() {
  const { election_id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);      // { election, total_votes, candidates[] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      const res = await axios.get(`/results/live/${election_id}`);
      setData(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load results.");
    } finally {
      setLoading(false);
    }
  }, [election_id]);

  // Initial load
  useEffect(() => { fetchResults(); }, [fetchResults]);

  // Auto-refresh every 5 seconds while voting is open and not finalized
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(fetchResults, 5000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchResults]);

  const handleFinalize = async () => {
    if (!window.confirm("Finalize this election? Voting will be permanently closed and the winner will be declared.")) return;
    setFinalizing(true);
    setError("");
    try {
      const res = await axios.post(`/results/finalize/${election_id}`);
      setMessage(res.data?.message || "Election finalized successfully!");
      await fetchResults();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize election.");
    } finally {
      setFinalizing(false);
    }
  };

  const election = data?.election;
  const candidates = data?.candidates || [];
  const totalVotes = data?.total_votes || 0;
  const isFinalized = election?.is_finalized;
  const isVotingOpen = election?.status === "voting_open";

  const statusLabel = isFinalized
    ? "🏁 Finalized"
    : isVotingOpen
    ? "🗳 Voting Open"
    : election?.status || "—";

  const statusClass = isFinalized
    ? "rp-status-finalized"
    : isVotingOpen
    ? "rp-status-voting"
    : "rp-status-other";

  return (
    <>
      <style>{css}</style>
      <div className="rp-root">
        <div className="rp-inner">

          {/* ── HEADER ── */}
          <div className="rp-header">
            <div>
              <p className="rp-badge">Election Manager · Results</p>
              <h2 className="rp-title">
                {election?.title || "Election Results"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <span className={`rp-status ${statusClass}`}>
                  {isVotingOpen && !isFinalized && <span className="rp-live-dot" />}
                  {statusLabel}
                </span>
                <span className="rp-subtitle" style={{ margin: 0 }}>
                  {isVotingOpen && !isFinalized ? "Live · Auto-refreshing every 5s" : ""}
                </span>
              </div>
            </div>
            <button className="rp-back-btn" onClick={() => navigate("/elections")}>
              ← Back to Elections
            </button>
          </div>

          {/* ── MESSAGES ── */}
          {error && <div className="rp-error">⚠ {error}</div>}
          {message && <div className="rp-success">✅ {message}</div>}

          {/* ── LOADING ── */}
          {loading ? (
            <p className="rp-loading">Loading results…</p>
          ) : (
            <>
              {/* ── STAT CARDS ── */}
              <div className="rp-stats">
                <div className="rp-stat">
                  <div className="rp-stat-label">Total Votes</div>
                  <div className="rp-stat-value">{totalVotes}</div>
                  <div className="rp-stat-sub">votes cast</div>
                </div>
                <div className="rp-stat">
                  <div className="rp-stat-label">Candidates</div>
                  <div className="rp-stat-value">{candidates.length}</div>
                  <div className="rp-stat-sub">on ballot</div>
                </div>
                {isFinalized && candidates[0] && (
                  <div className="rp-stat">
                    <div className="rp-stat-label">Winner</div>
                    <div className="rp-stat-value" style={{ fontSize: 16, lineHeight: 1.3, marginTop: 4 }}>
                      {candidates[0].full_name}
                    </div>
                    <div className="rp-stat-sub">{candidates[0].vote_percent}% of votes</div>
                  </div>
                )}
                {isFinalized && candidates[0] && (
                  <div className="rp-stat">
                    <div className="rp-stat-label">Score (30%)</div>
                    <div className="rp-stat-value" style={{ color: "#c8a85a" }}>
                      {candidates[0].converted_score}
                      <span style={{ fontSize: 14, color: "rgba(200,168,90,0.6)" }}>%</span>
                    </div>
                    <div className="rp-stat-sub">out of 30%</div>
                  </div>
                )}
              </div>

              {/* ── CONTROLS ── */}
              <div className="rp-controls">
                {!isFinalized && (
                  <button
                    className="rp-btn rp-btn-gold"
                    onClick={handleFinalize}
                    disabled={finalizing || totalVotes === 0}
                    title={totalVotes === 0 ? "No votes yet — cannot finalize" : "Finalize election and declare winner"}
                  >
                    {finalizing ? "Finalizing…" : "Finalize Election"}
                  </button>
                )}
                <button className="rp-btn rp-btn-ghost" onClick={fetchResults}>
                  ↻ Refresh
                </button>
                {!isFinalized && (
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      style={{ accentColor: "#c8a85a" }}
                    />
                    <span className="rp-auto-label">Auto-refresh (5s)</span>
                  </label>
                )}
              </div>

              <hr className="rp-divider" />

              {/* ── CANDIDATE RESULT LIST ── */}
              {candidates.length === 0 ? (
                <div className="rp-empty">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🗳</div>
                  <p>No approved candidates found for this election.</p>
                </div>
              ) : (
                <div className="rp-list">
                  {candidates.map((c, idx) => {
                    const barWidth = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0;
                    return (
                      <div
                        key={c.candidate_id}
                        className={`rp-row${c.is_winner ? " winner" : ""}`}
                      >
                        {/* TOP ROW: rank + photo + name + vote count */}
                        <div className="rp-row-top">
                          <div className={`rp-rank${idx === 0 ? " gold" : ""}`}>
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                          </div>

                          {c.photo_url ? (
                            <img src={c.photo_url} alt={c.full_name} className="rp-photo" />
                          ) : (
                            <div className="rp-initials">
                              {c.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="rp-info">
                            <div className="rp-name">
                              {c.full_name}
                              {c.is_winner && (
                                <span className="rp-winner-badge"> Winner</span>
                              )}
                            </div>
                            <div className="rp-position">{c.position}</div>
                          </div>

                          <div>
                            <div className="rp-vote-count">{c.votes}</div>
                            <div className="rp-vote-label">votes</div>
                          </div>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className="rp-bar-wrap">
                          <div
                            className={`rp-bar${c.is_winner ? " winner-bar" : ""}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>

                        {/* SCORES */}
                        <div className="rp-scores">
                          <div className="rp-score-item">
                            Vote share: <strong>{c.vote_percent}%</strong>
                          </div>
                          <div className="rp-score-item">
                            Score (30% scale):{" "}
                            <strong className="converted">{c.converted_score}%</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── FINALIZED NOTICE ── */}
              {isFinalized && (
                <div style={{
                  marginTop: 28, padding: "16px 20px",
                  background: "rgba(200,168,90,0.06)",
                  border: "1px solid rgba(200,168,90,0.2)",
                  borderRadius: 12, fontSize: 13,
                  color: "rgba(240,236,224,0.5)"
                }}>
                  🏁 This election has been <strong style={{ color: "#c8a85a" }}>finalized</strong>.
                  Voting is permanently closed.
                  The converted scores (30% scale) reflect each candidate's share of the total votes.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ResultsPage;
