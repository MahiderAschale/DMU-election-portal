
import { useEffect, useState , useCallback} from "react";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .apply-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .apply-inner { max-width: 640px; margin: 0 auto; }
  .apply-header { margin-bottom: 32px; }
  .apply-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f0ece0; margin-bottom: 6px; }
  .apply-vacancy-card {
    background: linear-gradient(135deg, rgba(200,168,90,0.1), rgba(200,168,90,0.04));
    border: 1px solid rgba(200,168,90,0.3);
    border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;
  }
  .apply-vacancy-card h3 { font-family: 'Playfair Display', serif; font-size: 20px; color: #c8a85a; margin-bottom: 8px; }
  .apply-vacancy-card p { font-size: 14px; color: rgba(240,236,224,0.6); margin-bottom: 4px; }
  .apply-form { display: flex; flex-direction: column; gap: 0; }
  .form-section { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 28px; margin-bottom: 20px; }
  .form-section-title { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,168,90,0.15); }
  .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 7px; }
  .field-input, .field-select, .field-textarea {
    width: 100%; padding: 12px 14px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2);
    border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif;
    font-size: 14px; outline: none; transition: border-color 0.2s, background 0.2s; margin-bottom: 16px;
  }
  .field-input:focus, .field-select:focus, .field-textarea:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .field-input::placeholder, .field-textarea::placeholder { color: rgba(240,236,224,0.2); }
  .field-select option { background: #11162a; }
  .field-textarea { resize: vertical; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .file-wrap {
    border: 1.5px dashed rgba(200,168,90,0.25); border-radius: 8px;
    padding: 16px; margin-bottom: 16px; background: rgba(200,168,90,0.03); transition: border-color 0.2s;
  }
  .file-wrap:hover { border-color: rgba(200,168,90,0.5); }
  .file-wrap input[type="file"] { width: 100%; color: rgba(240,236,224,0.5); font-size: 13px; }
  .submit-btn {
    width: 100%; padding: 16px;
    background: linear-gradient(135deg, #c8a85a, #e0c57a);
    color: #0a0e1a; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600; border: none;
    border-radius: 10px; cursor: pointer; transition: all 0.25s;
    letter-spacing: 0.3px;
  }
  .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(200,168,90,0.4); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .success-box {
    max-width: 480px; margin: 120px auto; text-align: center;
    background: #11162a; border: 1px solid rgba(50,200,100,0.3);
    border-radius: 16px; padding: 48px 40px;
  }
  .success-icon { font-size: 52px; margin-bottom: 20px; }
  .success-title { font-family: 'Playfair Display', serif; font-size: 26px; color: #5ddc8a; margin-bottom: 12px; }
  .success-text { font-size: 15px; color: rgba(240,236,224,0.5); margin-bottom: 32px; }
  .back-btn {
    display: inline-block; padding: 13px 28px;
    background: linear-gradient(135deg, #c8a85a, #e0c57a);
    color: #0a0e1a; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600; border: none;
    border-radius: 8px; cursor: pointer; text-decoration: none; transition: all 0.25s;
  }
  .back-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(200,168,90,0.4); }
`;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

function ApplyVacancy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    vacancy_id: "", full_name: "", email: "", 
    country_code: "+251", phone_rest: "",
    gender: "", disability: "", educational_level: "", work_experience: "", leadership: "",
    photo_upload: null, strategic_plan_file: null, educational_document: null, work_efficiency_file: null
  });

  useEffect(() => { if (id) setForm(prev => ({ ...prev, vacancy_id: id })); }, [id]);

  const fetchVacancy = useCallback(async () => {
    try { const res = await api.get(`/vacancies/${id}`); setVacancy(res.data.data || res.data); }
    catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => {
    fetchVacancy();
  }, [fetchVacancy]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = async (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;
    try { const encoded = await fileToDataUrl(file); setForm((prev) => ({ ...prev, [name]: encoded })); }
    catch { alert("Unable to process selected file."); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Phone validation
    if (form.phone_rest.length !== 9 || !/^\d+$/.test(form.phone_rest)) {
      return alert("Phone number must be exactly 9 digits.");
    }

    const payload = {
      ...form,
      phone_number: `${form.country_code}${form.phone_rest}`
    };

    // Filter out internal fields
    const data = Object.fromEntries(Object.entries(payload).filter(([key, value]) => 
      value !== null && value !== "" && key !== 'country_code' && key !== 'phone_rest'
    ));

    try {
      setLoading(true);
      await api.post("/applications", data);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <style>{styles}</style>
        <div className="apply-root">
          <div className="success-box">
            
            <h2 className="success-title">Application Submitted!</h2>
            <p className="success-text">Your application is now <strong style={{color:'#f0ece0'}}>pending review</strong>. We'll reach out to you soon.</p>
            <button className="back-btn" onClick={() => navigate("/vacancies-list")}>← Back to Vacancies</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="apply-root">
        <div className="apply-inner">
          <div className="apply-header">
            <h2 className="apply-title">Apply for Vacancy</h2>
          </div>

          {vacancy && (
            <div className="apply-vacancy-card">
              <h3>{vacancy.position_name}</h3>
              <p>📍 {vacancy.campus}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="apply-form">
            {/* Personal Info */}
            <div className="form-section">
              <div className="form-section-title">Personal Information</div>
              <div className="grid-2">
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="field-input" name="full_name" placeholder="Your full name" onChange={handleChange} required />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input className="field-input" name="email" type="email" placeholder="you@email.com" onChange={handleChange} required />
                </div>
              </div>
              <div className="grid-2">
                <div>
                  <label className="field-label">Phone Number</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      className="field-select" 
                      style={{ width: '100px', marginBottom: 0 }}
                      value={form.country_code}
                      onChange={e => setForm({...form, country_code: e.target.value})}
                    >
                      <option value="+251">+251 (ET)</option>
                      <option value="+254">+254 (KE)</option>
                      <option value="+255">+255 (TZ)</option>
                      <option value="+1">+1 (US)</option>
                    </select>
                    <input 
                      className="field-input" 
                      style={{ marginBottom: 0 }}
                      placeholder="9XXXXXXXX" 
                      maxLength="9"
                      value={form.phone_rest} 
                      onChange={e => setForm({...form, phone_rest: e.target.value.replace(/\D/g, "")})} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="field-label">Gender</label>
                  <select className="field-select" name="gender" onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <label className="field-label">Disability (optional)</label>
              <input className="field-input" name="disability" placeholder="Please specify if applicable" onChange={handleChange} />
              <label className="field-label">Educational Level</label>
              <input className="field-input" name="educational_level" placeholder="e.g. Master's Degree" onChange={handleChange} required />
            </div>

            {/* Experience */}
            <div className="form-section">
              <div className="form-section-title">Experience & Leadership</div>
              <label className="field-label">Work Experience</label>
              <textarea className="field-textarea" name="work_experience" placeholder="Describe your relevant work experience..." onChange={handleChange} rows="3" required />
              <label className="field-label">Leadership Experience</label>
              <textarea className="field-textarea" name="leadership" placeholder="Describe your leadership roles and achievements..." onChange={handleChange} rows="3" required />
            </div>

            {/* Documents */}
            <div className="form-section">
              <div className="form-section-title">Documents & Photo</div>
              <label className="field-label">Profile Photo</label>
              <div className="file-wrap"><input type="file" name="photo_upload" accept="image/*" onChange={handleFile} required /></div>
              <label className="field-label">Strategic Plan (PDF/DOC)</label>
              <div className="file-wrap"><input type="file" name="strategic_plan_file" accept=".pdf,.doc,.docx" onChange={handleFile} required /></div>
              <label className="field-label">Educational Document (PDF/DOC)</label>
              <div className="file-wrap"><input type="file" name="educational_document" accept=".pdf,.doc,.docx" onChange={handleFile} required /></div>
              <label className="field-label">Work Efficiency Document (PDF/DOC)</label>
              <div className="file-wrap"><input type="file" name="work_efficiency_file" accept=".pdf,.doc,.docx" onChange={handleFile} required /></div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Submitting Application..." : "Submit Application →"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ApplyVacancy;