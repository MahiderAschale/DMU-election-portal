import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .vm-root {
    min-height: 100vh;
    background: #0a0e1a;
    padding: 48px 24px;
    font-family: 'DM Sans', sans-serif;
    color: #f0ece0;
  }

  .vm-inner {
    max-width: 900px;
    margin: 0 auto;
  }

  .vm-badge {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c8a85a;
    margin-bottom: 12px;
  }

  .vm-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    margin-bottom: 30px;
  }

  .vm-form {
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.15);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 40px;
  }

  .vm-form h3 {
    margin-bottom: 20px;
    font-family: 'Playfair Display', serif;
  }

  .vm-input, .vm-textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 14px;
    border-radius: 8px;
    border: 1px solid rgba(200,168,90,0.2);
    background: #0a0e1a;
    color: #f0ece0;
    font-family: 'DM Sans', sans-serif;
  }

  .vm-input:focus, .vm-textarea:focus {
    outline: none;
    border-color: #c8a85a;
  }

  .vm-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .btn-primary {
    padding: 10px 18px;
    background: rgba(200,168,90,0.15);
    color: #c8a85a;
    border: 1px solid rgba(200,168,90,0.35);
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-primary:hover {
    background: rgba(200,168,90,0.25);
  }

  .btn-secondary {
    padding: 10px 18px;
    background: transparent;
    color: #aaa;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    cursor: pointer;
  }

  .vm-card {
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.15);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 14px;
    transition: 0.2s;
  }

  .vm-card:hover {
    border-color: rgba(200,168,90,0.3);
    transform: translateY(-2px);
  }

  .vm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .vm-position {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
  }

  .vm-campus {
    font-size: 12px;
    color: #c8a85a;
    border: 1px solid rgba(200,168,90,0.3);
    padding: 4px 10px;
    border-radius: 20px;
  }

  .vm-info {
    font-size: 14px;
    margin-top: 6px;
    color: rgba(240,236,224,0.7);
  }

  .vm-info b {
    color: #c8a85a;
  }

  .vm-desc {
    margin-top: 10px;
    color: rgba(240,236,224,0.6);
  }

  .vm-card-actions {
    margin-top: 14px;
    display: flex;
    gap: 10px;
  }

  .btn-edit {
    padding: 8px 14px;
    background: rgba(80,150,255,0.12);
    color: #7aa7ff;
    border: 1px solid rgba(80,150,255,0.3);
    border-radius: 6px;
    cursor: pointer;
  }

  .btn-delete {
    padding: 8px 14px;
    background: rgba(220,50,50,0.12);
    color: #ff7070;
    border: 1px solid rgba(220,50,50,0.3);
    border-radius: 6px;
    cursor: pointer;
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: rgba(240,236,224,0.3);
  }
`;

function Vacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [form, setForm] = useState({
    position_name: "",
    campus: "",
    educational_level: "",
    specific_requirement: "",
    description: "",
    duration_days: 7
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const fetchPositions = async () => {
    try {
      const res = await api.get("/positions");
      const data = res.data.data || res.data;
      setPositions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVacancies = async () => {
    try {
      const res = await api.get("/vacancies");
      const data = res.data.data || res.data;
      setVacancies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchVacancies();
  }, []);

  useEffect(() => {
    if (location.state?.prefilledPositionName && positions.length > 0) {
      const selectedPos = positions.find(p => p.position_name === location.state.prefilledPositionName);
      setForm(prev => ({
        ...prev,
        position_name: location.state.prefilledPositionName,
        position_id: selectedPos ? selectedPos.id : ""
      }));
    }
  }, [location, positions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "position_name") {
      const selectedPos = positions.find(p => p.position_name === value);
      setForm({ ...form, position_name: value, position_id: selectedPos ? selectedPos.id : "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      position_id: "",
      position_name: "",
      campus: "",
      educational_level: "",
      specific_requirement: "",
      description: "",
      status: "open",
      duration_days: 7
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.position_name) return alert("Position required");

    setLoading(true);
    try {
      await api.post("/vacancies", form);
      resetForm();
      fetchVacancies();
      alert("Created successfully");
    } catch {
      alert("Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (v) => {
    setEditingVacancy(v);
    setForm(v);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/vacancies/${editingVacancy.id}`, form);
      setEditingVacancy(null);
      resetForm();
      fetchVacancies();
      alert("Updated successfully");
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vacancy?")) return;
    try {
      await api.delete(`/vacancies/${id}`);
      fetchVacancies();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="vm-root">
        <div className="vm-inner">
          <p className="vm-badge">Admin Panel</p>
          <h2 className="vm-title">Manage Vacancies</h2>

          <form
            className="vm-form"
            onSubmit={editingVacancy ? handleUpdate : handleCreate}
          >
            <h3>{editingVacancy ? "Update Vacancy" : "Create Vacancy"}</h3>

            <input
              list="positions"
              name="position_name"
              value={form.position_name}
              onChange={handleChange}
              className="vm-input"
              placeholder="Select or type position"
            />

            <datalist id="positions">
              {positions.map((p) => (
                <option key={p.id} value={p.position_name} />
              ))}
            </datalist>

            <input name="campus" placeholder="Campus" value={form.campus} onChange={handleChange} className="vm-input" />
            <input name="educational_level" placeholder="Educational Level" value={form.educational_level} onChange={handleChange} className="vm-input" />
            <input name="specific_requirement" placeholder="Specific Requirement" value={form.specific_requirement} onChange={handleChange} className="vm-input" />
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#c8a85a", marginBottom: "5px", textAlign: "left" }}>
                Open Duration (1-7 Days):
              </label>
              <input 
                type="number" 
                name="duration_days" 
                min="1" 
                max="7" 
                value={form.duration_days} 
                onChange={handleChange} 
                className="vm-input" 
                placeholder="Duration in days (1 to 7)"
              />
            </div>
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="vm-textarea" rows="3" />

            <div className="vm-actions">
              <button className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : editingVacancy ? "Update" : "Create"}
              </button>

              {editingVacancy && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingVacancy(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {vacancies.length === 0 ? (
            <div className="empty-state">No vacancies found.</div>
          ) : (
            vacancies.map((v) => (
              <div key={v.id} className="vm-card" style={{ opacity: v.status === 'closed' ? 0.7 : 1 }}>
                <div className="vm-header">
                  <div className="vm-position">
                    {v.position_name}
                    {v.status === 'closed' && <span style={{ marginLeft: '10px', fontSize: '10px', background: '#ff4444', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>CLOSED</span>}
                    {v.status === 'open' && <span style={{ marginLeft: '10px', fontSize: '10px', background: '#44ff44', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>OPEN</span>}
                  </div>
                  <div className="vm-campus">{v.campus}</div>
                </div>

                <div className="vm-info"><b>Level:</b> {v.educational_level}</div>
                <div className="vm-info"><b>Requirement:</b> {v.specific_requirement}</div>
                <div className="vm-info" style={{ color: '#c8a85a' }}>
                  <b>Open For:</b> {v.duration_days || 7} days 
                  {v.created_at && ` (Posted: ${new Date(v.created_at).toLocaleDateString()})`}
                </div>

                {v.description && <div className="vm-desc">{v.description}</div>}

                <div className="vm-card-actions">
                  <button className="btn-edit" onClick={() => handleEdit(v)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(v.id)}>Delete</button>
                  {v.status === 'closed' && (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                      onClick={async () => {
                        if (window.confirm("Re-open this vacancy?")) {
                          await api.put(`/vacancies/${v.id}`, { ...v, status: 'open' });
                          fetchVacancies();
                        }
                      }}
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Vacancies;