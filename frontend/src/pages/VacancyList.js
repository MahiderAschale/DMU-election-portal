import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .vl-root {
    min-height: 100vh;
    background: #0a0e1a;
    padding: 48px 24px;
    font-family: 'DM Sans', sans-serif;
    color: #f0ece0;
  }

  .vl-inner {
    max-width: 900px;
    margin: 0 auto;
  }

  .vl-badge {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c8a85a;
    margin-bottom: 12px;
  }

  .vl-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 32px;
  }

  .vl-card {
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.15);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    transition: 0.2s;
  }

  .vl-card:hover {
    border-color: rgba(200,168,90,0.3);
    transform: translateY(-2px);
  }

  .vl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .vl-position {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: #f0ece0;
  }

  .vl-campus {
    font-size: 12px;
    color: #c8a85a;
    border: 1px solid rgba(200,168,90,0.3);
    padding: 4px 10px;
    border-radius: 20px;
  }

  .vl-info {
    font-size: 14px;
    color: rgba(240,236,224,0.7);
    margin: 6px 0;
  }

  .vl-info b {
    color: #c8a85a;
  }

  .vl-desc {
    margin-top: 10px;
    font-size: 14px;
    color: rgba(240,236,224,0.6);
    line-height: 1.5;
  }

  .vl-actions {
    margin-top: 16px;
  }

  .btn-apply {
    padding: 10px 20px;
    background: rgba(200,168,90,0.15);
    color: #c8a85a;
    border: 1px solid rgba(200,168,90,0.35);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-apply:hover {
    background: rgba(200,168,90,0.25);
  }

  .empty-state {
    text-align: center;
    padding: 80px 0;
    color: rgba(240,236,224,0.3);
    font-size: 15px;
  }
`;

function VacancyList() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchVacancies = async () => {
    try {
      const res = await api.get("/vacancies?status=open");
      const data = res.data.data || res.data;
      setVacancies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch vacancies:", err);
      setError("Failed to load vacancies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  return (
    <>
      <style>{styles}</style>

      <div className="vl-root">
        <div className="vl-inner">
          <p className="vl-badge">Careers</p>
          <h2 className="vl-title">Available Vacancies</h2>

          {loading ? (
            <div className="empty-state">Loading vacancies...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : vacancies.length === 0 ? (
            <div className="empty-state">
              No vacancies available at the moment.
            </div>
          ) : (
            vacancies.map((v) => (
              <div key={v.id} className="vl-card">
                <div className="vl-header">
                  <div className="vl-position">
                    {v.position_name || "Untitled Position"}
                  </div>
                  <div className="vl-campus">{v.campus}</div>
                </div>

                <div className="vl-info">
                  <b>Educational Level:</b> {v.educational_level}
                </div>

                <div className="vl-info">
                  <b>Requirement:</b> {v.specific_requirement}
                </div>

                {v.created_at && (
                  <div className="vl-info" style={{ color: '#c8a85a', fontSize: '13px', marginTop: '8px' }}>
                     <b>Closes on:</b> {(() => {
                      const created = new Date(v.created_at);
                      const closes = new Date(created.getTime() + (v.duration_days || 7) * 24 * 60 * 60 * 1000);
                      return closes.toLocaleDateString();
                    })()}
                  </div>
                )}

                {v.description && (
                  <div className="vl-desc">{v.description}</div>
                )}

                <div className="vl-actions">
                  <button
                    className="btn-apply"
                    onClick={() => navigate(`/apply/${v.id}`)}
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default VacancyList;