// pages/Positions.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .pos-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .pos-inner { max-width: 900px; margin: 0 auto; }
  .pos-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .pos-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  .create-box { background: #11162a; border: 1px solid rgba(200,168,90,0.2); border-radius: 14px; padding: 28px; margin-bottom: 36px; }
  .section-head { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,168,90,0.15); }
  .create-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 7px; }
  .field-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, background 0.2s; }
  .field-input:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .field-input::placeholder { color: rgba(240,236,224,0.2); }
  .btn-add { padding: 12px 24px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
  .btn-add:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,168,90,0.4); }
  .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
  .pos-count { font-size: 13px; color: rgba(240,236,224,0.4); margin-bottom: 16px; }
  .pos-list { display: flex; flex-direction: column; gap: 16px; }
  .pos-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 24px; display: grid; grid-template-columns: 1fr auto auto; gap: 24px; transition: border-color 0.2s; position: relative; overflow: hidden; }
  .pos-card:hover { border-color: rgba(200,168,90,0.3); }
  .pos-card-info { }
  .pos-card-name { font-size: 18px; font-weight: 600; color: #f0ece0; margin-bottom: 6px; }
  .pos-card-desc { font-size: 13px; color: rgba(240,236,224,0.45); margin-bottom: 12px; }
  .tenure-info { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px 16px; border-left: 3px solid #c8a85a; min-width: 200px; }
  .tenure-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: rgba(200,168,90,0.7); margin-bottom: 4px; }
  .tenure-value { font-size: 13px; color: #f0ece0; margin-bottom: 8px; font-weight: 500; }
  .expiry-countdown { font-size: 12px; font-weight: 600; color: #c8a85a; }
  .status-badge { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .status-expired { background: rgba(220,50,50,0.15); color: #ff7070; border: 1px solid rgba(220,50,50,0.3); }
  .status-active { background: rgba(50,220,50,0.1); color: #70ff70; border: 1px solid rgba(50,220,50,0.2); }
  .btn-group { display: flex; flex-direction: column; gap: 8px; }
  .btn-delete { padding: 8px 16px; background: rgba(220,50,50,0.05); color: #ff7070; border: 1px solid rgba(220,50,50,0.15); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-delete:hover { background: rgba(220,50,50,0.15); }
  .btn-vacancy { padding: 8px 16px; background: #c8a85a; color: #0a0e1a; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center; }
  .empty-state { text-align: center; padding: 60px 0; color: rgba(240,236,224,0.3); font-size: 15px; }
  .expired-banner { position: absolute; top: 12px; right: -30px; background: #dc3232; color: white; padding: 4px 40px; transform: rotate(45deg); font-size: 10px; font-weight: 800; letter-spacing: 1px; }
`;

function Positions() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [position_name, setPositionName] = useState("");
  const [description, setDescription] = useState("");
  const [currently_assigned_person, setCurrentlyAssignedPerson] = useState("");
  const [assigned_date, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tenure_years, setTenureYears] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPositions = async () => {
    try { 
      const res = await api.get("/positions"); 
      setPositions(res.data.data || res.data); 
    } catch (err) { 
      console.error("Failed to fetch positions:", err); 
    }
  };

  useEffect(() => { fetchPositions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!position_name) return alert("Position name is required");
    setLoading(true);
    try {
      await api.post("/positions", { 
        position_name, 
        description,
        currently_assigned_person,
        assigned_date,
        tenure_years: tenure_years ? parseInt(tenure_years) : null
      });
      setPositionName(""); 
      setDescription("");
      setCurrentlyAssignedPerson("");
      setTenureYears("");
      fetchPositions();
      alert("Position created successfully");
    } catch (err) { 
      alert(err.response?.data?.message || "Error creating position"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;
    try { 
      await api.delete(`/positions/${id}`); 
      fetchPositions(); 
    } catch (err) { 
      alert(err.response?.data?.message || "Delete failed"); 
    }
  };

  const handleUpdateHolder = async (posId, winnerName) => {
    if (!window.confirm(`Update current holder to ${winnerName}?`)) return;
    try {
      await api.put(`/positions/${posId}`, {
        currently_assigned_person: winnerName,
        assigned_date: new Date().toISOString().split('T')[0]
      });
      fetchPositions();
      alert("Holder updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pos-root">
        <div className="pos-inner">
          <p className="pos-badge">Administration</p>
          <h2 className="pos-title">Manage Positions & Tenure</h2>

          <div className="create-box">
            <div className="section-head">Create New Position</div>
            <form onSubmit={handleCreate}>
              <div className="create-grid">
                <div>
                  <label className="field-label">Position Name</label>
                  <input className="field-input" placeholder="e.g. Student Council President" value={position_name} onChange={(e) => setPositionName(e.target.value)} required />
                </div>
                <div>
                  <label className="field-label">Currently Assigned Person</label>
                  <input className="field-input" placeholder="e.g. John Doe" value={currently_assigned_person} onChange={(e) => setCurrentlyAssignedPerson(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Assignment Date</label>
                  <input type="date" className="field-input" value={assigned_date} onChange={(e) => setAssignedDate(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Tenure Length (Years)</label>
                  <input type="number" className="field-input" placeholder="e.g. 2" value={tenure_years} onChange={(e) => setTenureYears(e.target.value)} />
                </div>
              </div>
              <label className="field-label">Description (optional)</label>
              <input className="field-input" placeholder="Brief description of the role..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: '24px' }} />
              
              <button type="submit" className="btn-add" disabled={loading}>
                {loading ? "Adding..." : "+ Add Position"}
              </button>
            </form>
          </div>

          <div className="section-head">All Positions</div>
          <p className="pos-count">{positions.length} position{positions.length !== 1 ? "s" : ""} total</p>

          {positions.length === 0 ? (
            <div className="empty-state">No positions found. Create one above.</div>
          ) : (
            <div className="pos-list">
              {positions.map((pos) => (
                <div key={pos.id} className="pos-card">
                  {pos.is_expired && <div className="expired-banner">EXPIRED</div>}
                  
                  <div className="pos-card-info">
                    <div className="pos-card-name">{pos.position_name || pos.name}</div>
                    {pos.description && <div className="pos-card-desc">{pos.description}</div>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <span className={`status-badge ${pos.is_expired ? 'status-expired' : 'status-active'}`}>
                        {pos.is_expired ? 'Term Expired' : 'Active Term'}
                      </span>
                    </div>
                  </div>

                  <div className="tenure-info">
                    <div className="tenure-label">Current Holder</div>
                    <div className="tenure-value">{pos.currently_assigned_person || "Unassigned"}</div>
                    
                    {pos.expiry_date && (
                      <>
                        <div className="tenure-label">Expiry Date</div>
                        <div className="tenure-value">{new Date(pos.expiry_date).toLocaleDateString()}</div>
                        <div className="expiry-countdown">
                          {pos.is_expired ? "0.00" : pos.years_remaining} years remaining
                        </div>
                      </>
                    )}

                    {/* Winner Info from Latest Election */}
                    {pos.elections && pos.elections.length > 0 && pos.elections[0].winner && (
                      <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(200,168,90,0.1)', borderRadius: '6px', border: '1px dashed rgba(200,168,90,0.3)' }}>
                        <div className="tenure-label" style={{ color: '#e0c57a' }}>Latest Election Winner</div>
                        <div className="tenure-value" style={{ margin: 0 }}>{pos.elections[0].winner.user?.full_name}</div>
                        {pos.currently_assigned_person !== pos.elections[0].winner.user?.full_name && (
                           <div style={{ marginTop: '8px' }}>
                             <button 
                               className="btn-vacancy" 
                               style={{ background: '#70ff70', color: '#0a0e1a', width: '100%', padding: '6px' }}
                               onClick={() => handleUpdateHolder(pos.id, pos.elections[0].winner.user?.full_name)}
                             >
                               Assign Winner
                             </button>
                           </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="btn-group">
                    <button 
                      className="btn-vacancy" 
                      onClick={() => navigate('/vacancies', { state: { prefilledPositionName: pos.position_name } })}
                    >
                      Post Vacancy
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(pos.id)}>Delete</button>
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

export default Positions;
