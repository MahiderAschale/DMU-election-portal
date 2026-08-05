import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .win-root {
    min-height: 100vh;
    background: #0a0e1a;
    padding: 60px 24px;
    font-family: 'DM Sans', sans-serif;
    color: #f0ece0;
    position: relative;
    overflow: hidden;
  }

  .win-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(200,168,90,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,168,90,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 1;
  }

  .win-inner {
    max-width: 1000px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .btn-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: rgba(240,236,224,0.6);
    border: 1px solid rgba(240,236,224,0.15);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    margin-bottom: 32px;
  }

  .btn-back:hover {
    color: #c8a85a;
    border-color: #c8a85a;
    background: rgba(200,168,90,0.05);
  }

  .win-header {
    text-align: center;
    margin-bottom: 50px;
  }

  .win-badge {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c8a85a;
    margin-bottom: 12px;
  }

  .win-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 900;
    color: #f0ece0;
    margin-bottom: 12px;
  }

  .win-subtitle {
    font-size: 15px;
    color: rgba(240,236,224,0.5);
    max-width: 600px;
    margin: 0 auto;
  }

  .win-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 24px;
  }

  .win-card {
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.15);
    border-radius: 16px;
    padding: 30px 24px;
    text-align: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .win-card:hover {
    border-color: rgba(200,168,90,0.5);
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(200,168,90,0.1);
  }

  .win-photo-frame {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 20px;
    position: relative;
    border: 2px solid #c8a85a;
    padding: 4px;
    background: rgba(200,168,90,0.05);
  }

  .win-photo {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .win-photo-ph {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(200,168,90,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: #c8a85a;
  }

  .win-laurel {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #c8a85a;
    color: #0a0e1a;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(200,168,90,0.3);
  }

  .win-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #f0ece0;
    margin-bottom: 6px;
  }

  .win-email {
    font-size: 12px;
    color: rgba(240,236,224,0.4);
    margin-bottom: 20px;
  }

  .win-divider {
    height: 1px;
    background: rgba(200,168,90,0.12);
    margin: 16px 0;
  }

  .win-detail-lbl {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(240,236,224,0.35);
    margin-bottom: 4px;
  }

  .win-detail-val {
    font-size: 14px;
    font-weight: 500;
    color: #c8a85a;
  }

  .win-election {
    font-size: 13px;
    color: rgba(240,236,224,0.75);
    line-height: 1.4;
  }

  .win-date {
    font-size: 11px;
    color: rgba(240,236,224,0.3);
    margin-top: 18px;
  }

  .win-loading, .win-empty, .win-error {
    text-align: center;
    padding: 80px 20px;
    color: rgba(240,236,224,0.4);
    font-size: 16px;
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.15);
    border-radius: 16px;
  }

  .win-error {
    color: #ff7070;
    border-color: rgba(220,50,50,0.3);
  }
`;

function WinnersPage() {
  const navigate = useNavigate();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await api.get("/results/winners");
        setWinners(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load election winners. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="win-root">
        <div className="win-bg-grid" />

        <div className="win-inner">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Back to Home
          </button>

          <div className="win-header">
            <p className="win-badge"> Hall of Fame</p>
            <h1 className="win-title">Elections Winners</h1>
            <p className="win-subtitle">
              Celebrating our newly elected leaders who will pave the way forward for academic excellence and growth.
            </p>
          </div>

          {loading ? (
            <div className="win-loading">Loading winners list...</div>
          ) : error ? (
            <div className="win-error"> {error}</div>
          ) : winners.length === 0 ? (
            <div className="win-empty">
              <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}></span>
              No finalized elections or winners declared yet.
            </div>
          ) : (
            <div className="win-grid">
              {winners.map((w) => (
                <div key={w.election_id} className="win-card">
                  <span className="win-laurel">Winner</span>

                  <div className="win-photo-frame">
                    {w.winner_photo ? (
                      <img className="win-photo" src={w.winner_photo} alt={w.winner_name} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="win-photo-ph">👤</div>
                    )}
                  </div>

                  <div className="win-name">{w.winner_name}</div>
                  <div className="win-email">{w.winner_email}</div>

                  <div className="win-divider" />

                  <div style={{ marginBottom: "14px" }}>
                    <div className="win-detail-lbl">Assigned Position</div>
                    <div className="win-detail-val">{w.position_name}</div>
                    <div style={{ fontSize: "11px", color: "rgba(240,236,224,0.4)", marginTop: "2px" }}>
                      Campus: {w.campus}
                    </div>
                  </div>

                  <div>
                    <div className="win-detail-lbl">From Election</div>
                    <div className="win-election">{w.election_title}</div>
                  </div>

                  <div className="win-date">
                    Finalized: {w.finalized_at ? new Date(w.finalized_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default WinnersPage;
