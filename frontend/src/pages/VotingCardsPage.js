import { useEffect, useState } from "react";
import axios from "../api/axios";

/* ─── Inline styles ─────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .vc-root {
    min-height: 100vh;
    background: #0a0e1a;
    padding: 40px 24px;
    font-family: 'DM Sans', sans-serif;
    color: #f0ece0;
  }
  .vc-inner { max-width: 1100px; margin: 0 auto; }

  .vc-badge {
    font-size: 11px; font-weight: 500; letter-spacing: 3px;
    text-transform: uppercase; color: #c8a85a; margin-bottom: 10px;
  }
  .vc-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 6px;
  }
  .vc-subtitle {
    font-size: 14px; color: rgba(240,236,224,0.4); margin-bottom: 36px;
  }

  /* Election group */
  .vc-election-group { margin-bottom: 40px; }
  .vc-election-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px; padding-bottom: 14px;
    border-bottom: 1px solid rgba(200,168,90,0.2);
  }
  .vc-election-num {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg,#c8a85a,#e0c57a);
    color: #0a0e1a; font-weight: 700; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .vc-election-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px; color: #f0ece0;
  }
  .vc-election-count {
    margin-left: auto; font-size: 12px; color: rgba(200,168,90,0.7);
    background: rgba(200,168,90,0.08); border: 1px solid rgba(200,168,90,0.15);
    border-radius: 20px; padding: 3px 10px;
  }

  /* Cards grid */
  .vc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 18px;
  }

  /* Individual card */
  .vc-card {
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.15);
    border-radius: 14px;
    overflow: hidden;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    display: flex; flex-direction: column;
  }
  .vc-card:hover {
    transform: translateY(-4px);
    border-color: rgba(200,168,90,0.4);
    box-shadow: 0 12px 32px rgba(0,0,0,0.4);
  }

  /* Card photo */
  .vc-card-photo-wrap {
    width: 100%; aspect-ratio: 1/1; overflow: hidden;
    background: rgba(200,168,90,0.06);
    display: flex; align-items: center; justify-content: center;
  }
  .vc-card-photo { width: 100%; height: 100%; object-fit: cover; }
  .vc-card-initials {
    font-family: 'Playfair Display', serif;
    font-size: 52px; font-weight: 700;
    color: #c8a85a; opacity: 0.6;
  }

  /* Card body */
  .vc-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .vc-card-name { font-size: 15px; font-weight: 600; color: #f0ece0; }
  .vc-card-position { font-size: 12px; color: #c8a85a; }
  .vc-card-email { font-size: 11px; color: rgba(240,236,224,0.35); }
  .vc-card-code {
    font-family: monospace; font-size: 10px;
    color: rgba(240,236,224,0.25);
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 4px; padding: 3px 7px; margin-top: 4px;
    display: inline-block;
  }

  /* Status / divider */
  .vc-card-divider {
    border: none; border-top: 1px solid rgba(200,168,90,0.1);
    margin: 6px 0;
  }

  /* Empty / loading */
  .vc-empty {
    text-align: center; padding: 60px 20px;
    color: rgba(240,236,224,0.3); font-size: 15px;
  }
  .vc-loading {
    color: rgba(240,236,224,0.35); font-size: 14px; padding: 60px 0;
    text-align: center;
  }
  .vc-error {
    color: #ff9a9a; background: rgba(220,50,50,0.1);
    border: 1px solid rgba(220,50,50,0.3);
    border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;
    font-size: 13px;
  }

  .vc-refresh-btn {
    border: 1px solid rgba(200,168,90,0.3);
    border-radius: 8px; padding: 9px 20px;
    background: rgba(200,168,90,0.08);
    color: #c8a85a; font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 13px; cursor: pointer;
    transition: all 0.2s;
  }
  .vc-refresh-btn:hover { background: rgba(200,168,90,0.18); }

  @media (max-width: 640px) {
    .vc-root { padding: 24px 14px; }
    .vc-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    .vc-title { font-size: 24px; }
  }
`;

function VotingCardsPage() {
  const [groups, setGroups] = useState([]); // [{ election, cards[] }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllCards = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/voting-cards/all");
      const raw = res.data?.data || [];

      // Group by election, preserving election_id order (backend already sorts ASC)
      const map = new Map();
      raw.forEach((card) => {
        const eid = card.election_id ?? card.election?.id ?? "unknown";
        if (!map.has(eid)) {
          map.set(eid, {
            election: card.election || { id: eid, title: `Election ${eid}` },
            cards: []
          });
        }
        map.get(eid).cards.push(card);
      });

      setGroups(Array.from(map.values()));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load voting cards. Make sure you are logged in as a manager or authorised user."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCards();
  }, []);

  const totalCards = groups.reduce((n, g) => n + g.cards.length, 0);

  return (
    <>
      <style>{css}</style>
      <div className="vc-root">
        <div className="vc-inner">
          {/* Header */}
          <p className="vc-badge">Election Management</p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 className="vc-title">Voting Cards</h2>
              <p className="vc-subtitle">
                All generated voting cards — categorized by election order
                {!loading && totalCards > 0 && ` · ${totalCards} cards across ${groups.length} election${groups.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button className="vc-refresh-btn" onClick={fetchAllCards} disabled={loading}>
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {/* Error */}
          {error && <div className="vc-error">⚠ {error}</div>}

          {/* Loading */}
          {loading ? (
            <p className="vc-loading">Loading voting cards…</p>
          ) : groups.length === 0 ? (
            <div className="vc-empty">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🗳</div>
              <p>No voting cards have been generated yet.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Go to the Election Dashboard and click "Generate Voting Cards" for an election.
              </p>
            </div>
          ) : (
            groups.map((group, idx) => (
              <div key={group.election.id} className="vc-election-group">
                {/* Election header */}
                <div className="vc-election-header">
                  <div className="vc-election-num">{idx + 1}</div>
                  <div className="vc-election-name">
                    {group.election.title || `Election ${group.election.id}`}
                  </div>
                  <span className="vc-election-count">
                    {group.cards.length} card{group.cards.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Cards grid */}
                <div className="vc-grid">
                  {group.cards.map((card) => {
                    const candidate = card.candidate;
                    const user = candidate?.user;
                    const photo = candidate?.application?.photo_upload_url;
                    const initials = (user?.full_name || "?").charAt(0).toUpperCase();

                    return (
                      <div key={card.id} className="vc-card">
                        {/* Photo */}
                        <div className="vc-card-photo-wrap">
                          {photo ? (
                            <img
                              src={photo}
                              alt={user?.full_name || "Candidate"}
                              className="vc-card-photo"
                            />
                          ) : (
                            <span className="vc-card-initials">{initials}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="vc-card-body">
                          <div className="vc-card-name">
                            {user?.full_name || "Unknown Candidate"}
                          </div>
                          <div className="vc-card-position">
                            {candidate?.position?.position_name || "—"}
                          </div>
                          <div className="vc-card-email">{user?.email || "—"}</div>
                          <hr className="vc-card-divider" />
                          <span className="vc-card-code">{card.card_code}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default VotingCardsPage;