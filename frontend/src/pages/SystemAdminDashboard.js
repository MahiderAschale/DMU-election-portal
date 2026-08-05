// pages/SystemAdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  .admin-root { min-height: 100vh; background: #0a0e1a; padding: 40px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .admin-inner { max-width: 1100px; margin: 0 auto; }
  .admin-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .admin-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  
  /* Stats Grid */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 48px; }
  .stat-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 16px; padding: 24px; transition: transform 0.2s; }
  .stat-card:hover { transform: translateY(-4px); border-color: rgba(200,168,90,0.3); }
  .stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(240,236,224,0.4); margin-bottom: 8px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #c8a85a; }
  .stat-sub { font-size: 13px; color: rgba(240,236,224,0.3); margin-top: 4px; }

  /* Section Title */
  .section-title { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(200,168,90,0.15); display: flex; justify-content: space-between; align-items: center; }

  /* Manager Management */
  .manager-layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; }
  
  /* Form */
  .form-box { background: #11162a; border: 1px solid rgba(200,168,90,0.2); border-radius: 14px; padding: 28px; height: fit-content; }
  .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 7px; }
  .field-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; margin-bottom: 20px; }
  .field-input:focus { border-color: #c8a85a; }
  
  .btn-submit { width: 100%; padding: 12px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
  .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(200,168,90,0.4); }

  /* Table */
  .table-box { background: #11162a; border: 1px solid rgba(200,168,90,0.1); border-radius: 14px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; background: rgba(255,255,255,0.02); padding: 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(200,168,90,0.7); }
  td { padding: 16px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
  
  .status-tag { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  .tag-active { background: rgba(50,220,50,0.1); color: #70ff70; border: 1px solid rgba(50,220,50,0.2); }
  .tag-inactive { background: rgba(220,50,50,0.1); color: #ff7070; border: 1px solid rgba(220,50,50,0.2); }
  
  .btn-toggle { padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
  .btn-deactivate { background: rgba(220,50,50,0.1); color: #ff7070; border-color: rgba(220,50,50,0.2); }
  .btn-activate { background: rgba(50,220,50,0.1); color: #70ff70; border-color: rgba(50,220,50,0.2); }
  .btn-toggle:hover { opacity: 0.8; }
`;

function SystemAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({ 
    full_name: "", 
    email: "", 
    password: "", 
    college_id: "",
    country_code: "+251", // Default to Ethiopia as example
    phone_rest: ""
  });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, managersRes] = await Promise.all([
        api.get("/admin/reports"),
        api.get("/admin/managers")
      ]);
      setStats(statsRes.data.data);
      setManagers(managersRes.data.data);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return alert("Password must be 8+ chars, 1 uppercase, 1 special char.");
    }

    // Phone validation
    if (formData.phone_rest.length !== 9 || !/^\d+$/.test(formData.phone_rest)) {
      return alert("Phone number must be exactly 9 digits.");
    }

    setCreating(true);
    try {
      const payload = {
        ...formData,
        phone_number: `${formData.country_code}${formData.phone_rest}`
      };
      await api.post("/admin/managers", payload);
      setFormData({ full_name: "", email: "", password: "", college_id: "", country_code: "+251", phone_rest: "" });
      fetchData();
      alert("Election Manager created successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (!window.confirm(`Are you sure you want to ${newStatus} this manager?`)) return;
    
    try {
      await api.patch(`/admin/managers/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="admin-root"><p>Loading Admin Dashboard...</p></div>;

  return (
    <>
      <style>{styles + `
        .phone-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .code-select { width: 100px; padding: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; outline: none; }
      `}</style>
      <div className="admin-root">
        <div className="admin-inner">
          <p className="admin-badge"> System Administration</p>
          <h2 className="admin-title">Platform Overview</h2>

          {/*  REPORTS SECTION */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Elections</div>
              <div className="stat-value">{stats?.total_elections}</div>
              <div className="stat-sub">active & finalized</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Votes</div>
              <div className="stat-value">{stats?.total_votes}</div>
              <div className="stat-sub">ballots cast</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats?.total_users}</div>
              <div className="stat-sub">across all roles</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Participation</div>
              <div className="stat-value">{stats?.voter_participation}%</div>
              <div className="stat-sub">voter engagement</div>
            </div>
          </div>

          <div className="manager-layout">
            {/* 👥 MANAGER LIST */}
            <div>
              <div className="section-title">
                Election Managers
                <span style={{ fontSize: '13px', color: 'rgba(240,236,224,0.4)' }}>
                  {managers.length} Total
                </span>
              </div>
              <div className="table-box">
                <table>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map(m => (
                      <tr key={m.id}>
                        <td>{m.full_name}</td>
                        <td>{m.email}</td>
                        <td>
                          <span className={`status-tag ${m.status === 'active' ? 'tag-active' : 'tag-inactive'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`btn-toggle ${m.status === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                            onClick={() => toggleStatus(m.id, m.status)}
                          >
                            {m.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {managers.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: 'rgba(240,236,224,0.3)' }}>No election managers found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ➕ CREATE MANAGER FORM */}
            <div>
              <div className="section-title">Create Manager</div>
              <div className="form-box">
                <form onSubmit={handleCreate}>
                  <label className="field-label">Full Name</label>
                  <input 
                    className="field-input" 
                    placeholder="John Doe" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})} 
                    required 
                  />
                  
                  <label className="field-label">Email Address</label>
                  <input 
                    className="field-input" 
                    type="email"
                    placeholder="manager@uni.edu" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                  />

                  <label className="field-label">Phone Number</label>
                  <div className="phone-row">
                    <select 
                      className="code-select"
                      value={formData.country_code}
                      onChange={e => setFormData({...formData, country_code: e.target.value})}
                    >
                      <option value="+251">+251 (ET)</option>
                      <option value="+254">+254 (KE)</option>
                      <option value="+255">+255 (TZ)</option>
                      <option value="+256">+256 (UG)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                    </select>
                    <input 
                      className="field-input" 
                      style={{ marginBottom: 0 }}
                      placeholder="9XXXXXXXX" 
                      maxLength="9"
                      value={formData.phone_rest} 
                      onChange={e => setFormData({...formData, phone_rest: e.target.value.replace(/\D/g, "")})} 
                      required 
                    />
                  </div>

                  <label className="field-label">Temporary Password</label>
                  <input 
                    className="field-input" 
                    type="password"
                    placeholder="Min 8 chars, 1 Capital, 1 Special" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required 
                  />

                  <label className="field-label">College ID (Optional)</label>
                  <input 
                    className="field-input" 
                    type="number"
                    placeholder="e.g. 1" 
                    value={formData.college_id} 
                    onChange={e => setFormData({...formData, college_id: e.target.value})} 
                  />

                  <button className="btn-submit" type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Account"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SystemAdminDashboard;
