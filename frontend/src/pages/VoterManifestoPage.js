import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import JitsiMeeting from "../components/JitsiMeeting";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  .vmp-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .vmp-inner { max-width: 860px; margin: 0 auto; }
  .vmp-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .vmp-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  
  .vmp-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 16px; padding: 32px; margin-bottom: 24px; }
  .vmp-section-title { font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(200,168,90,0.1); }
  
  .vmp-field-group { margin-bottom: 20px; }
  .vmp-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 8px; }
  .vmp-select { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.2); border-radius: 8px; color: #f0ece0; font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none; appearance: none; cursor: pointer; }
  .vmp-select:disabled { opacity: 0.5; cursor: not-allowed; }
  
  .vmp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .vmp-info-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 14px 18px; }
  .vmp-info-val { font-size: 15px; color: #f0ece0; font-weight: 500; }
  
  .vmp-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
  .vmp-btn { border: none; border-radius: 8px; padding: 12px 24px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .vmp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .vmp-btn-primary { background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; }
  .vmp-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(200,168,90,0.3); }
  .vmp-btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(200,168,90,0.25); color: #f0ece0; }
  .vmp-btn-danger { background: rgba(220,50,50,0.1); color: #ff7070; border: 1px solid rgba(220,50,50,0.2); }
  .vmp-btn-vote { background: linear-gradient(135deg, #7ee0c4, #5ddc8a); color: #0a0e1a; width: 100%; justify-content: center; font-size: 16px; padding: 16px; margin-top: 12px; }

  .vmp-status { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
  .status-live { background: rgba(93,220,138,0.15); color: #5ddc8a; }
  .status-closed { background: rgba(220,50,50,0.12); color: #ff7070; }
  .status-scheduled { background: rgba(200,168,90,0.15); color: #c8a85a; }

  .vmp-meeting-container { margin-top: 32px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(200,168,90,0.25); background: #000; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
  
  .vmp-message { padding: 16px; border-radius: 10px; font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
  .msg-error { background: rgba(220,50,50,0.1); border: 1px solid rgba(220,50,50,0.2); color: #ff9a9a; }
  .msg-success { background: rgba(93,220,138,0.1); border: 1px solid rgba(93,220,138,0.2); color: #7ee0c4; }
  
  .vmp-loading { text-align: center; padding: 100px 0; color: rgba(240,236,224,0.3); font-size: 16px; }
  .vmp-empty { text-align: center; padding: 60px 0; color: rgba(240,236,224,0.3); }
`;

function VoterManifestoPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeJoin, setActiveJoin] = useState(null);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyElectionId, setBusyElectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [now, setNow] = useState(new Date());

  // Parse server timestamp helper
  const parseServerTimestamp = (str) => {
    if (!str) return new Date(NaN);
    const clean = str.replace("T", " ").trim();
    const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})[\s](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return new Date(NaN);
    const [, yr, mo, dy, hr, mn, sc = "0"] = match;
    return new Date(Number(yr), Number(mo) - 1, Number(dy), Number(hr), Number(mn), Number(sc));
  };

  // Update 'now' every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMyManifestos = async () => {
      try {
        const res = await axios.get("/manifesto/my");
        const data = res.data?.data || [];
        setSessions(data);
        setSelectedSession(data[0] || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load manifesto sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchMyManifestos();
  }, []);

  const manifestoClosed = useMemo(() => {
    if (!selectedSession) return false;
    return (
      selectedSession.election?.status === "voting_open" ||
      selectedSession.election?.is_finalized ||
      Boolean(selectedSession.end_time && parseServerTimestamp(selectedSession.end_time) <= now)
    );
  }, [selectedSession, now]);

  const joinManifesto = async (session) => {
    if (!session?.election_id) return;
    setBusyElectionId(session.election_id);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/manifesto/join", { election_id: session.election_id });
      const data = res.data?.data || {};
      setActiveJoin({
        attendance: data.attendance,
        meeting_link: data.meeting_link || session.meeting_link,
        jitsi_token: data.jitsi_token || null
      });
      setMeetingOpen(true);
      setMessage("You have joined the manifesto session. Stay for at least 5 minutes to validate your attendance.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join manifesto session");
    } finally {
      setBusyElectionId(null);
    }
  };

  const leaveManifesto = async (session) => {
    if (!session?.election_id) return;
    setBusyElectionId(session.election_id);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/manifesto/leave", { election_id: session.election_id });
      const duration = res.data?.data?.duration_minutes;
      const valid = res.data?.data?.is_valid;
      
      setMessage(`Left session. Duration: ${duration} minutes. ${valid ? " Attendance validated." : " Attendance not valid (5+ mins required)."}`);
      setActiveJoin(null);
      setMeetingOpen(false);
      setTimeLeft(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave manifesto session");
    } finally {
      setBusyElectionId(null);
    }
  };

  // ── AUTO END LOGIC (Same as Candidate Dashboard) ─────────────────────────
  useEffect(() => {
    if (!meetingOpen || !selectedSession?.end_time) return undefined;

    const msUntilEnd = parseServerTimestamp(selectedSession.end_time).getTime() - Date.now();

    const handleAutoEnd = async () => {
      await leaveManifesto(selectedSession);
      // Automatically redirect voter to vote page
      navigate('/vote');
    };

    if (msUntilEnd <= 0) {
      handleAutoEnd();
      return undefined;
    }

    const timer = setTimeout(() => {
      handleAutoEnd();
    }, msUntilEnd);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingOpen, selectedSession?.end_time, selectedSession?.election_id, navigate]);

  // ── COUNTDOWN TIMER ──
  useEffect(() => {
    if (!meetingOpen || !selectedSession?.end_time) return;
    const update = () => {
      const ms = parseServerTimestamp(selectedSession.end_time).getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft(null);
      } else {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n) => String(n).padStart(2, "0");
        setTimeLeft(h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [meetingOpen, selectedSession?.end_time]);

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="vmp-root"><div className="vmp-loading">Loading manifesto sessions...</div></div>
    </>
  );

  const isBusy = busyElectionId === selectedSession?.election_id;

  return (
    <div className="vmp-root">
      <style>{styles}</style>
      <div className="vmp-inner">
        <p className="vmp-badge">Awareness & Dialogue</p>
        <h2 className="vmp-title">Manifesto Participation</h2>

        {error && <div className="vmp-message msg-error">{error}</div>}
        {message && <div className="vmp-message msg-success">{message}</div>}

        {sessions.length === 0 ? (
          <div className="vmp-card vmp-empty">
            <p>No manifesto sessions are currently available for your elections.</p>
          </div>
        ) : (
          <>
            <div className="vmp-card">
              <div className="vmp-section-title">Session Details</div>
              
              <div className="vmp-field-group">
                <label className="vmp-label">Select Election</label>
                <select
                  className="vmp-select"
                  value={selectedSession?.id || ""}
                  disabled={meetingOpen}
                  onChange={(e) => {
                    const next = sessions.find((s) => String(s.id) === e.target.value);
                    setSelectedSession(next || null);
                    setActiveJoin(null);
                    setMeetingOpen(false);
                    setMessage("");
                    setError("");
                  }}
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.election?.title || `Election ${s.election_id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <span className={`vmp-status ${manifestoClosed ? 'status-closed' : 'status-live'}`}>
                  {manifestoClosed ? 'Session Closed' : 'Session Live / Scheduled'}
                </span>
              </div>

              <div className="vmp-grid">
                <div className="vmp-info-box">
                  <label className="vmp-label">Scheduled Start</label>
                  <div className="vmp-info-val">
                    {selectedSession?.start_time ? parseServerTimestamp(selectedSession.start_time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </div>
                </div>
                <div className="vmp-info-box">
                  <label className="vmp-label">Scheduled End</label>
                  <div className="vmp-info-val">
                    {selectedSession?.end_time ? parseServerTimestamp(selectedSession.end_time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </div>
                  {meetingOpen && timeLeft && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#c8a85a', fontWeight: 'bold' }}>
                      Ends in: {timeLeft}
                    </div>
                  )}
                </div>
              </div>

              {manifestoClosed ? (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <p style={{ color: 'rgba(240,236,224,0.5)', fontSize: 14, marginBottom: 16 }}>
                    This manifesto session has concluded. You can now proceed to the voting section to cast your vote.
                  </p>
                  <button 
                    className="vmp-btn vmp-btn-vote"
                    onClick={() => navigate('/vote')}
                  >
                     Proceed to Vote
                  </button>
                </div>
              ) : (
                <div className="vmp-actions">
                  {!meetingOpen ? (
                    <button
                      className="vmp-btn vmp-btn-primary"
                      onClick={() => joinManifesto(selectedSession)}
                      disabled={isBusy}
                    >
                      {isBusy ? "Joining..." : "Join Meeting Now"}
                    </button>
                  ) : (
                    <button
                      className="vmp-btn vmp-btn-danger"
                      onClick={() => leaveManifesto(selectedSession)}
                      disabled={isBusy}
                    >
                      {isBusy ? "Leaving..." : "Leave Meeting"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {meetingOpen && activeJoin && (
              <div className="vmp-meeting-container">
                <JitsiMeeting
                  meetingLink={activeJoin.meeting_link}
                  displayName="Voter"
                  jwt={activeJoin.jitsi_token}
                  onJoin={() => setMessage("You are now in the meeting. Stay connected to validate attendance.")}
                  onLeave={() => leaveManifesto(selectedSession)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VoterManifestoPage;
