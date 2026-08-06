import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ed-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .ed-inner { max-width: 980px; margin: 0 auto; }
  .ed-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .ed-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 36px; }
  .create-box { background: #11162a; border: 1px solid rgba(200,168,90,0.2); border-radius: 14px; padding: 32px; margin-bottom: 36px; }
  .section-head { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,168,90,0.15); }
  .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 7px; }
  .field-input, .field-select, .field-textarea { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, background 0.2s; margin-bottom: 16px; box-sizing: border-box; }
  .field-input:focus, .field-select:focus, .field-textarea:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .field-input::placeholder, .field-textarea::placeholder { color: rgba(240,236,224,0.2); }
  .field-select option { background: #11162a; }
  .field-textarea { resize: vertical; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .btn-gold { padding: 12px 24px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
  .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,168,90,0.4); }
  .elections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .election-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 22px; transition: border-color 0.2s; }
  .election-card:hover { border-color: rgba(200,168,90,0.35); }
  .election-name { font-family: 'Playfair Display', serif; font-size: 17px; color: #f0ece0; margin-bottom: 8px; }
  .election-position { font-size: 13px; color: #c8a85a; margin-bottom: 8px; font-weight: 500; }
  .election-dates { font-size: 12px; color: rgba(240,236,224,0.4); margin-bottom: 14px; }
  .manifesto-meta { font-size: 12px; color: rgba(240,236,224,0.5); margin-bottom: 8px; line-height: 1.7; background: rgba(200,168,90,0.06); border: 1px solid rgba(200,168,90,0.12); border-radius: 8px; padding: 10px; }
  .manifesto-status-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .tag-scheduled { background: rgba(200,168,90,0.15); color: #c8a85a; }
  .tag-live { background: rgba(93,220,138,0.15); color: #5ddc8a; }
  .tag-ended { background: rgba(220,50,50,0.12); color: #ff7070; }
  .tag-voting { background: rgba(105,185,160,0.15); color: #7ee0c4; }
  .attendance-box { background: rgba(255,255,255,0.025); border: 1px solid rgba(200,168,90,0.1); border-radius: 8px; padding: 10px; margin: 10px 0; }
  .attendance-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
  .attendance-stat { font-size: 11px; color: rgba(240,236,224,0.5); }
  .attendance-stat strong { display: block; color: #f0ece0; font-size: 16px; margin-top: 2px; }
  .attendance-list { max-height: 130px; overflow-y: auto; display: grid; gap: 5px; }
  .attendance-row { font-size: 11px; color: rgba(240,236,224,0.62); display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid rgba(240,236,224,0.06); padding-top: 5px; }
  .card-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
  .btn-card { padding: 8px 13px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
  .btn-card:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-card-primary { background: rgba(200,168,90,0.12); color: #c8a85a; border: 1px solid rgba(200,168,90,0.25); }
  .btn-card-primary:hover:not(:disabled) { background: rgba(200,168,90,0.22); }
  .btn-card-secondary { background: rgba(105,185,160,0.1); color: #7ee0c4; border: 1px solid rgba(105,185,160,0.25); }
  .btn-card-secondary:hover:not(:disabled) { background: rgba(105,185,160,0.2); }
  .btn-card-danger { background: rgba(220,50,50,0.1); color: #ff7070; border: 1px solid rgba(220,50,50,0.2); }
  .btn-card-danger:hover:not(:disabled) { background: rgba(220,50,50,0.2); }
  .btn-card-live { background: rgba(93,220,138,0.15); color: #5ddc8a; border: 1px solid rgba(93,220,138,0.3); }
  .btn-card-live:hover:not(:disabled) { background: rgba(93,220,138,0.25); }
  /* Generate cards button — distinct gold-filled style */
  .btn-card-generate { background: linear-gradient(135deg, rgba(200,168,90,0.25), rgba(200,168,90,0.15)); color: #e0c57a; border: 1px solid rgba(200,168,90,0.5); font-weight: 600; }
  .btn-card-generate:hover:not(:disabled) { background: linear-gradient(135deg, rgba(200,168,90,0.4), rgba(200,168,90,0.25)); box-shadow: 0 0 12px rgba(200,168,90,0.25); }
  /* Results button */
  .btn-card-results { background: rgba(105,185,160,0.12); color: #7ee0c4; border: 1px solid rgba(105,185,160,0.3); font-weight: 600; }
  .btn-card-results:hover:not(:disabled) { background: rgba(105,185,160,0.22); box-shadow: 0 0 10px rgba(105,185,160,0.15); }
  .empty-state { text-align: center; padding: 40px; color: rgba(240,236,224,0.3); font-size: 14px; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
  .modal-box { background: #11162a; border: 1px solid rgba(200,168,90,0.3); border-radius: 16px; padding: 32px; width: 100%; max-width: 440px; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #f0ece0; margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: rgba(240,236,224,0.4); margin-bottom: 22px; }
  .modal-hint { font-size: 12px; color: rgba(200,168,90,0.7); margin-bottom: 16px; padding: 8px 10px; background: rgba(200,168,90,0.06); border-radius: 6px; }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
  .btn-modal-cancel { flex: 1; padding: 11px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(240,236,224,0.6); font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
  .btn-modal-save { flex: 2; padding: 11px; background: linear-gradient(135deg, #c8a85a, #e0c57a); border: none; border-radius: 8px; color: #0a0e1a; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }
  input[type="datetime-local"] { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; box-sizing: border-box; margin-bottom: 16px; color-scheme: dark; }
  input[type="datetime-local"]:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }

  /* Moderator meeting panel */
  .moderator-panel { background: #0d1220; border: 1.5px solid rgba(93,220,138,0.3); border-radius: 14px; padding: 24px; margin-top: 24px; }
  .moderator-panel-title { font-family: 'Playfair Display', serif; font-size: 18px; color: #5ddc8a; margin-bottom: 16px; }
  .live-attendance { display: grid; gap: 6px; max-height: 200px; overflow-y: auto; margin-top: 12px; }
  .live-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(255,255,255,0.04); border-radius: 6px; font-size: 12px; }
  .live-badge { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; }
  .badge-active { background: rgba(93,220,138,0.15); color: #5ddc8a; }
  .badge-valid { background: rgba(105,185,160,0.15); color: #7ee0c4; }
  .badge-invalid { background: rgba(220,50,50,0.12); color: #ff7070; }
  .moderator-controls { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
  @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } .ed-root { padding: 28px 14px; } .elections-grid { grid-template-columns: 1fr; } }
`;

function ElectionDashboard() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [manifestoSessions, setManifestoSessions] = useState({});
  const [manifestoAttendances, setManifestoAttendances] = useState({});
  const [loadingManifestoId, setLoadingManifestoId] = useState(null);
  // Track which election is currently generating voting cards
  const [generatingCardsId, setGeneratingCardsId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", position_id: "", start_date: "", end_date: "" });

  // Manifesto creation modal state
  const [manifestoModal, setManifestoModal] = useState(null); // { election, startVal, endVal }

  // Moderator panel: which election the manager is currently moderating in-page
  const [moderatorSession, setModeratorSession] = useState(null); // { election, link, endTime }
  const attendancePollRef = useRef(null);

  // ── TIME HELPERS ──────────────────────────────────────────────────────────

  const parseServerTimestamp = (str) => {
    if (!str) return new Date(NaN);
    const clean = str.replace("T", " ").trim();
    const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})[\s](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return new Date(NaN);
    const [, yr, mo, dy, hr, mn, sc = "0"] = match;
    return new Date(Number(yr), Number(mo) - 1, Number(dy), Number(hr), Number(mn), Number(sc));
  };

  const toDatetimeLocal = (serverTimestamp) => {
    if (!serverTimestamp) return "";
    const d = parseServerTimestamp(serverTimestamp);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const toLocalTimestamp = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const formatDisplayTime = (serverTimestamp) => {
    if (!serverTimestamp) return "—";
    const d = parseServerTimestamp(serverTimestamp);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  // ── FETCH ─────────────────────────────────────────────────────────────────

  const fetchManifestoSessions = async (list) => {
    const [sessionEntries, attendanceEntries] = await Promise.all([
      Promise.all(list.map(async (election) => {
        try {
          const res = await axios.get(`/manifesto/session/${election.id}`);
          return [election.id, res.data.data || null];
        } catch { return [election.id, null]; }
      })),
      Promise.all(list.map(async (election) => {
        try {
          const res = await axios.get(`/manifesto/all/${election.id}`);
          return [election.id, res.data.data || []];
        } catch { return [election.id, []]; }
      }))
    ]);
    setManifestoSessions(Object.fromEntries(sessionEntries));
    setManifestoAttendances(Object.fromEntries(attendanceEntries));
  };

  const fetchElections = useCallback(async () => {
    try {
      const res = await axios.get("/elections");
      const list = res.data.data || [];
      setElections(list);
      if (list.length > 0) await fetchManifestoSessions(list);
    } catch (err) { console.error(err); }
  },[]);

  useEffect(() => {
    fetchElections();
    axios.get("/positions").then((r) => setPositions(r.data.data || [])).catch(console.error);
  },[fetchElections]);

  // Poll manifesto sessions every 10 seconds
  useEffect(() => {
    if (elections.length === 0) return;
    const timer = setInterval(() => fetchManifestoSessions(elections), 10000);
    return () => clearInterval(timer);
  }, [elections]);

  // Poll live attendance every 5 seconds while moderator panel is open
  useEffect(() => {
    if (!moderatorSession) {
      clearInterval(attendancePollRef.current);
      return;
    }
    const pollAttendance = async () => {
      try {
        const res = await axios.get(`/manifesto/all/${moderatorSession.election.id}`);
        setManifestoAttendances((prev) => ({
          ...prev,
          [moderatorSession.election.id]: res.data.data || []
        }));
      } catch { /* ignore */ }
    };
    pollAttendance();
    attendancePollRef.current = setInterval(pollAttendance, 5000);
    return () => clearInterval(attendancePollRef.current);
  },[moderatorSession]);

  // ── CREATE ELECTION ───────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.title.trim() || !form.position_id || !form.start_date || !form.end_date) {
      alert("Please fill in all required fields."); return;
    }
    try {
      await axios.post("/elections", { ...form, position_id: Number(form.position_id) });
      alert("Election created successfully!");
      setForm({ title: "", description: "", position_id: "", start_date: "", end_date: "" });
      fetchElections();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create election");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this election? This cannot be undone.")) return;
    try {
      await axios.delete(`/elections/${id}`);
      fetchElections();
    } catch (err) { console.error(err); }
  };

  // ── GENERATE VOTING CARDS ─────────────────────────────────────────────────
  // This now lives here on the Election Dashboard, not on the shortlist page.

  const generateVotingCards = async (election) => {
    if (!window.confirm(`Generate voting cards for "${election.title}"? This will create cards for all approved candidates.`)) return;
    setGeneratingCardsId(election.id);
    try {
      const res = await axios.post("/voting-cards/generate", { election_id: election.id });
      const count = res.data?.data?.length ?? 0;
      alert(res.data?.message || `Voting cards generated! (${count} cards)`);
      // Navigate to the voting cards page filtered by this election
      navigate(`/voting-cards?election_id=${election.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate voting cards. Make sure there are approved candidates.");
    } finally {
      setGeneratingCardsId(null);
    }
  };

  // ── MANIFESTO MODAL ───────────────────────────────────────────────────────

  const openManifestoModal = (election) => {
    const existing = manifestoSessions[election.id];
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const defaultStart = existing?.start_time
      ? toDatetimeLocal(existing.start_time)
      : `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const defaultEnd = existing?.end_time
      ? toDatetimeLocal(existing.end_time)
      : `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours() + 1)}:${pad(now.getMinutes())}`;

    setManifestoModal({ election, startVal: defaultStart, endVal: defaultEnd });
  };

  const saveManifesto = async () => {
    const { election, startVal, endVal } = manifestoModal;
    if (!startVal || !endVal) { alert("Please select both start and end times."); return; }

    const startAt = new Date(startVal);
    const endAt = new Date(endVal);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      alert("Invalid date/time."); return;
    }
    if (endAt <= startAt) { alert("End time must be after start time!"); return; }

    try {
      setLoadingManifestoId(election.id);
      await axios.post("/manifesto/session", {
        election_id: Number(election.id),
        start_time: toLocalTimestamp(startAt),
        end_time:   toLocalTimestamp(endAt)
      });
      setManifestoModal(null);
      await fetchManifestoSessions(elections);
      alert(manifestoSessions[election.id] ? "Manifesto time updated!" : "Manifesto session created!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save manifesto session");
    } finally {
      setLoadingManifestoId(null);
    }
  };

  const deleteManifesto = async (election) => {
    if (!window.confirm("Delete this manifesto session?")) return;
    try {
      setLoadingManifestoId(election.id);
      await axios.delete(`/manifesto/session/${election.id}`);
      await fetchManifestoSessions(elections);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete manifesto");
    } finally { setLoadingManifestoId(null); }
  };

  const closeManifesto = async (election) => {
    if (!window.confirm("Close this manifesto session and open voting for valid attendees?")) return;
    try {
      setLoadingManifestoId(election.id);
      const res = await axios.post(`/manifesto/session/${election.id}/close`);
      await fetchElections();
      setModeratorSession(null);
      alert(res.data?.message || "Manifesto closed. Voting is now open.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close manifesto");
    } finally { setLoadingManifestoId(null); }
  };

  // ── MODERATOR JOIN ────────────────────────────────────────────────────────

  const joinAsModeratorInPage = async (election) => {
    try {
      setLoadingManifestoId(election.id);
      const res = await axios.get(`/manifesto/session/${election.id}/moderator-link`);
      const data = res.data?.data;
      if (!data?.moderator_link) {
        alert("Moderator link was not returned. Please try again."); return;
      }
      window.open(data.moderator_link, "_blank", "noopener,noreferrer");
      const session = manifestoSessions[election.id];
      setModeratorSession({
        election,
        link: data.moderator_link,
        endTime: session?.end_time || null
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to get moderator link");
      await fetchElections();
    } finally { setLoadingManifestoId(null); }
  };

  // ── STATUS HELPERS ────────────────────────────────────────────────────────

  const getManifestoStatus = (manifesto, election) => {
    if (!manifesto) return null;
    if (election?.status === "voting_open" || election?.is_finalized) return "voting";
    const now = new Date();
    const start = parseServerTimestamp(manifesto.start_time);
    const end = parseServerTimestamp(manifesto.end_time);
    if (end <= now) return "ended";
    if (start <= now) return "live";
    return "scheduled";
  };

  const getAttendanceSummary = (electionId) => {
    const rows = manifestoAttendances[electionId] || [];
    return {
      total: rows.length,
      valid: rows.filter((r) => r.is_valid).length,
      active: rows.filter((r) => !r.left_at).length
    };
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{styles}</style>

      {/* ── MANIFESTO TIME PICKER MODAL ── */}
      {manifestoModal && (
        <div className="modal-overlay" onClick={() => setManifestoModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Set Manifesto Time</div>
            <div className="modal-sub">Election: {manifestoModal.election.title}</div>
            <div className="modal-hint">
              ⚠ Times are in <strong>your local timezone</strong>. The system will save and compare them as-is — no conversion.
            </div>
            <label className="field-label">Start Date &amp; Time</label>
            <input
              type="datetime-local"
              value={manifestoModal.startVal}
              onChange={(e) => setManifestoModal({ ...manifestoModal, startVal: e.target.value })}
            />
            <label className="field-label">End Date &amp; Time</label>
            <input
              type="datetime-local"
              value={manifestoModal.endVal}
              onChange={(e) => setManifestoModal({ ...manifestoModal, endVal: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setManifestoModal(null)}>Cancel</button>
              <button className="btn-modal-save" onClick={saveManifesto}>Save Session</button>
            </div>
          </div>
        </div>
      )}

      <div className="ed-root">
        <div className="ed-inner">
          <p className="ed-badge">Election Manager</p>
          <h2 className="ed-title">Election Management</h2>

          {/* ── CREATE ELECTION ── */}
          <div className="create-box">
            <div className="section-head">Create New Election</div>
            <label className="field-label">Title</label>
            <input className="field-input" placeholder="Election title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <label className="field-label">Description</label>
            <textarea className="field-textarea" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <label className="field-label">Position</label>
            <select className="field-select" value={form.position_id} onChange={(e) => setForm({ ...form, position_id: e.target.value })}>
              <option value="">Select Position</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.position_name}</option>)}
            </select>
            <div className="grid-2">
              <div>
                <label className="field-label">Start Date</label>
                <input className="field-input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="field-label">End Date</label>
                <input className="field-input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <button className="btn-gold" onClick={handleCreate}>+ Create Election</button>
          </div>

          {/* ── ELECTIONS LIST ── */}
          <div className="section-head">All Elections</div>

          {elections.length === 0 ? (
            <div className="empty-state">No elections created yet.</div>
          ) : (
            <div className="elections-grid">
              {elections.map((election) => {
                const position = positions.find((p) => Number(p.id) === Number(election.position_id));
                const manifesto = manifestoSessions[election.id];
                const attendance = manifestoAttendances[election.id] || [];
                const summary = getAttendanceSummary(election.id);
                const status = getManifestoStatus(manifesto, election);
                const isLive = status === "live";
                const isEnded = status === "ended";
                const isVotingOpen = status === "voting";
                const busy = loadingManifestoId === election.id;
                const generatingCards = generatingCardsId === election.id;

                return (
                  <div key={election.id} className="election-card">
                    <div className="election-name">{election.title}</div>
                    <div className="election-position">{position?.position_name || "No position"}</div>
                    <div className="election-dates">{election.start_date} → {election.end_date}</div>

                    {manifesto && (
                      <div className="manifesto-meta">
                        <div style={{ marginBottom: 6 }}>
                          {status === "live" && <span className="manifesto-status-tag tag-live">🔴 LIVE NOW</span>}
                          {status === "scheduled" && <span className="manifesto-status-tag tag-scheduled">Scheduled</span>}
                          {status === "ended" && <span className="manifesto-status-tag tag-ended">Ended</span>}
                          {status === "voting" && <span className="manifesto-status-tag tag-voting">✅ Voting Open</span>}
                        </div>
                        Start: {formatDisplayTime(manifesto.start_time)}<br />
                        End: {formatDisplayTime(manifesto.end_time)}
                      </div>
                    )}

                    {manifesto && attendance.length > 0 && (
                      <div className="attendance-box">
                        <div className="attendance-summary">
                          <div className="attendance-stat">Joined<strong>{summary.total}</strong></div>
                          <div className="attendance-stat">Active<strong>{summary.active}</strong></div>
                          <div className="attendance-stat">Valid<strong>{summary.valid}</strong></div>
                        </div>
                        <div className="attendance-list">
                          {attendance.slice(0, 8).map((row) => (
                            <div key={row.id} className="attendance-row">
                              <span>{row.user?.full_name || row.user?.email || `User ${row.user_id}`}</span>
                              <span style={{ color: row.is_valid ? "#5ddc8a" : row.left_at ? "#ff7070" : "#c8a85a" }}>
                                {row.is_valid ? "Valid" : row.left_at ? "Invalid" : "Active"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="card-actions">
                      {/* ── MANIFESTO BUTTON ── */}
                      <button className="btn-card btn-card-secondary" disabled={busy || isVotingOpen} onClick={() => openManifestoModal(election)}>
                        {manifesto ? "Update Time" : "Create Manifesto"}
                      </button>

                      {manifesto && (
                        <>
                          <button
                            className={`btn-card ${isLive ? "btn-card-live" : "btn-card-primary"}`}
                            disabled={busy || isVotingOpen || isEnded}
                            onClick={() => joinAsModeratorInPage(election)}
                          >
                            {isLive ? "Join as Moderator" : isVotingOpen ? "Voting Open" : isEnded ? "Session Ended" : "Join Early"}
                          </button>

                          <button
                            className="btn-card btn-card-secondary"
                            disabled={busy || isVotingOpen || (!isLive && !isEnded)}
                            onClick={() => closeManifesto(election)}
                          >
                            {isVotingOpen ? "Voting Open" : "Close & Open Voting"}
                          </button>

                          <button className="btn-card btn-card-danger" disabled={busy} onClick={() => deleteManifesto(election)}>
                            Delete
                          </button>
                        </>
                      )}

                      {/* ── GENERATE VOTING CARDS ── */}
                      <button
                        className="btn-card btn-card-generate"
                        disabled={generatingCards || busy}
                        onClick={() => generateVotingCards(election)}
                        title="Generate voting cards for all approved candidates in this election"
                      >
                        {generatingCards ? "Generating…" : "Generate Cards"}
                      </button>

                      {/* ── VIEW RESULTS ── */}
                      <button
                        className="btn-card btn-card-results"
                        onClick={() => navigate(`/results/${election.id}`)}
                        title="View live vote results for this election"
                      >
                         Results
                      </button>

                      <button className="btn-card btn-card-danger" onClick={() => handleDelete(election.id)}>
                        Delete Election
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MODERATOR LIVE PANEL ── */}
          {moderatorSession && (
            <div className="moderator-panel">
              <div className="moderator-panel-title">
                🎙 Moderating: {moderatorSession.election.title}
              </div>
              <p style={{ fontSize: 13, color: "rgba(240,236,224,0.5)", marginBottom: 12 }}>
                The Jitsi meeting is open in a separate tab. Live attendance updates below every 5 seconds.
                {moderatorSession.endTime && (
                  <> Session ends at <strong style={{ color: "#c8a85a" }}>{formatDisplayTime(moderatorSession.endTime)}</strong>.</>
                )}
              </p>

              {/* Live attendance */}
              <div className="section-head" style={{ marginBottom: 10 }}>Live Attendance</div>
              {(() => {
                const rows = manifestoAttendances[moderatorSession.election.id] || [];
                if (rows.length === 0) return <p style={{ fontSize: 13, color: "rgba(240,236,224,0.3)" }}>No attendees yet.</p>;
                return (
                  <div className="live-attendance">
                    {rows.map((row) => (
                      <div key={row.id} className="live-row">
                        <span style={{ color: "#f0ece0" }}>{row.user?.full_name || row.user?.email || `User ${row.user_id}`}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "rgba(240,236,224,0.4)" }}>
                            {row.duration_minutes != null ? `${row.duration_minutes}m` : "In session"}
                          </span>
                          <span className={`live-badge ${row.is_valid ? "badge-valid" : row.left_at ? "badge-invalid" : "badge-active"}`}>
                            {row.is_valid ? "Valid" : row.left_at ? "Left" : "Active"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="moderator-controls">
                <button
                  className="btn-card btn-card-secondary"
                  onClick={() => closeManifesto(moderatorSession.election)}
                  disabled={loadingManifestoId === moderatorSession.election.id}
                >
                  Close Session &amp; Open Voting
                </button>
                <button className="btn-card btn-card-danger" onClick={() => setModeratorSession(null)}>
                  Hide Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ElectionDashboard;