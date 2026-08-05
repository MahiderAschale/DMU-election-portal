
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .evp-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .evp-inner { max-width: 720px; margin: 0 auto; }
  .evp-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .evp-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  .voter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .voter-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 14px; transition: border-color 0.2s; }
  .voter-card:hover { border-color: rgba(200,168,90,0.3); }
  .voter-avatar { width: 42px; height: 42px; background: linear-gradient(135deg, rgba(200,168,90,0.3), rgba(200,168,90,0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .voter-name { font-size: 15px; font-weight: 500; color: #f0ece0; margin-bottom: 3px; }
  .voter-email { font-size: 12px; color: rgba(240,236,224,0.4); }
  .empty-state { text-align: center; padding: 60px 0; color: rgba(240,236,224,0.3); font-size: 15px; }
`;

function ElectionVotersPage() {
  const { election_id } = useParams();
  const [voters, setVoters] = useState([]);

  const fetchVoters = async () => {
    try { const res = await axios.get(`/voter/election/${election_id}`); setVoters(res.data.data || []); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchVoters(); }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="evp-root">
        <div className="evp-inner">
          <p className="evp-badge">Election Management</p>
          <h2 className="evp-title">Approved Voters</h2>
          {voters.length === 0 ? (
            <div className="empty-state">No approved voters found for this election.</div>
          ) : (
            <div className="voter-grid">
              {voters.map((v) => (
                <div key={v.id} className="voter-card">
                  <div className="voter-avatar">👤</div>
                  <div>
                    <div className="voter-name">{v.full_name}</div>
                    <div className="voter-email">{v.email}</div>
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

export default ElectionVotersPage;