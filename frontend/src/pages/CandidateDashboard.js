import { useEffect, useState } from "react";
import axios from "../api/axios";
import JitsiMeeting from "../components/JitsiMeeting";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .cd-root { min-height: 100vh; background: #0a0e1a; padding: 48px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .cd-inner { max-width: 760px; margin: 0 auto; }
  .cd-page-label { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 12px; }
  .cd-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0ece0; margin-bottom: 32px; }
  .cd-profile-card { background: linear-gradient(135deg, rgba(200,168,90,0.1), rgba(200,168,90,0.03)); border: 1px solid rgba(200,168,90,0.3); border-radius: 16px; padding: 32px; margin-bottom: 24px; display: flex; align-items: center; gap: 24px; }
  .cd-avatar { width: 64px; height: 64px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; flex-shrink: 0; }
  .cd-name { font-family: 'Playfair Display', serif; font-size: 22px; color: #f0ece0; margin-bottom: 4px; }
  .cd-email { font-size: 14px; color: rgba(240,236,224,0.5); }
  .cd-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .cd-stat-card { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 20px; }
  .cd-stat-label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,224,0.4); margin-bottom: 8px; }
  .cd-stat-value { font-size: 16px; font-weight: 500; color: #f0ece0; }
  .cd-status-pending { color: #ffb400; }
  .cd-status-approved { color: #5ddc8a; }
  .cd-status-rejected { color: #ff7070; }
  .cd-section { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 28px; margin-bottom: 20px; }
  .cd-section-title { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,168,90,0.15); }
  .cd-info-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; font-size: 14px; color: rgba(240,236,224,0.7); }
  .cd-link { color: #c8a85a; text-decoration: none; }
  .cd-link:hover { text-decoration: underline; }
  .cd-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
  .cd-btn { border: none; border-radius: 8px; padding: 10px 16px; font-family: 'DM Sans', sans-serif; font-weight: 600; cursor: pointer; font-size: 14px; }
  .cd-btn-primary { background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; }
  .cd-btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(200,168,90,0.2); color: #f0ece0; }
  .cd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .cd-message { margin-top: 14px; color: #7ee0c4; font-size: 13px; line-height: 1.5; }
  .cd-empty { color: rgba(240,236,224,0.3); font-style: italic; font-size: 14px; }
  .cd-meeting { margin-top: 18px; overflow: hidden; border-radius: 10px; border: 1px solid rgba(200,168,90,0.2); }
  .cd-order { margin-top: 16px; padding: 0; list-style: none; display: grid; gap: 8px; }
  .cd-order-item { display: flex; justify-content: space-between; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.12); border-radius: 8px; padding: 10px 12px; color: rgba(240,236,224,0.72); font-size: 13px; }
  .cd-order-active { border-color: rgba(126,224,196,0.55); color: #7ee0c4; }
  .cd-loading { text-align: center; padding: 80px 0; color: rgba(240,236,224,0.4); font-size: 15px; }
  .cd-error { background: rgba(220,50,50,0.1); border: 1px solid rgba(220,50,50,0.3); color: #ff9a9a; border-radius: 10px; padding: 16px; }
  .cd-timer { font-size: 13px; color: rgba(200,168,90,0.8); margin-top: 8px; }

  /* Voting cards section */
  .cd-voting-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-top: 16px; }
  .cd-voting-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(200,168,90,0.18); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; }
  .cd-voting-card.cd-my-card { border-color: rgba(93,220,138,0.45); background: rgba(93,220,138,0.05); }
  .cd-candidate-photo { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
  .cd-candidate-initials { width: 52px; height: 52px; border-radius: 8px; background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
  .cd-candidate-name { font-size: 14px; font-weight: 600; color: #f0ece0; margin-bottom: 3px; }
  .cd-candidate-position { font-size: 12px; color: rgba(200,168,90,0.8); margin-bottom: 3px; }
  .cd-card-code { font-size: 11px; color: rgba(240,236,224,0.35); font-family: monospace; }
  .cd-you-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: rgba(93,220,138,0.2); color: #5ddc8a; margin-left: 6px; vertical-align: middle; }
  .cd-voting-loading { font-size: 13px; color: rgba(240,236,224,0.35); padding: 16px 0; }
  .cd-voting-notice { font-size: 13px; color: rgba(240,236,224,0.5); background: rgba(200,168,90,0.06); border: 1px solid rgba(200,168,90,0.12); border-radius: 8px; padding: 12px; margin-top: 12px; line-height: 1.6; }

  /* Thank you screen */
  .thankyou-wrap { min-height: 100vh; background: #0a0e1a; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; padding: 24px; }
  .thankyou-card { max-width: 520px; width: 100%; text-align: center; }
  .thankyou-icon { font-size: 64px; margin-bottom: 24px; }
  .thankyou-title { font-family: 'Playfair Display', serif; font-size: 36px; color: #f0ece0; margin-bottom: 16px; }
  .thankyou-sub { font-size: 18px; color: rgba(240,236,224,0.6); margin-bottom: 12px; line-height: 1.6; }
  .thankyou-note { font-size: 14px; color: rgba(200,168,90,0.8); margin-top: 16px; }
  .thankyou-divider { border: none; border-top: 1px solid rgba(200,168,90,0.15); margin: 32px 0; }

  @media (max-width: 720px) { .cd-grid { grid-template-columns: 1fr; } .cd-profile-card { align-items: flex-start; padding: 24px; } }
`;

function CandidateDashboard() {
  const [data, setData] = useState(null);
  const [manifesto, setManifesto] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [jitsiToken, setJitsiToken] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // When true, show the post-manifesto thank you screen instead of the dashboard
  const [showThankYou, setShowThankYou] = useState(false);

  // Voting cards for the candidate's election (visible after manifesto session)
  const [votingCards, setVotingCards] = useState([]);
  const [loadingVotingCards, setLoadingVotingCards] = useState(false);

  // ── PARSE SERVER TIMESTAMP (local time) ───────────────────────────────────
  const parseServerTimestamp = (str) => {
    if (!str) return new Date(NaN);
    const clean = str.replace("T", " ").trim();
    const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})[\s](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return new Date(NaN);
    const [, yr, mo, dy, hr, mn, sc = "0"] = match;
    return new Date(Number(yr), Number(mo) - 1, Number(dy), Number(hr), Number(mn), Number(sc));
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = parseServerTimestamp(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res = await axios.get("/candidates/me");
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidate dashboard");
    }
  };

  const fetchManifestoSession = async (electionId) => {
    if (!electionId) return;
    try {
      const res = await axios.get(`/manifesto/session/${electionId}`);
      setManifesto(res.data.data);
    } catch { setManifesto(null); }
  };

  // Fetch voting cards for this candidate's election
  const fetchVotingCards = async (electionId) => {
    if (!electionId) return;
    setLoadingVotingCards(true);
    try {
      const res = await axios.get(`/voting-cards/candidate?election_id=${electionId}`);
      setVotingCards(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load voting cards", err);
      setVotingCards([]);
    } finally {
      setLoadingVotingCards(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (data?.election_id) {
      fetchManifestoSession(data.election_id);
      fetchVotingCards(data.election_id);
    }
  }, [data?.election_id]);

  const statusClass = (status) => {
    if (status === "approved") return "cd-status-approved";
    if (status === "rejected") return "cd-status-rejected";
    return "cd-status-pending";
  };

  const currentManifesto = manifesto || data;
  const meetingLink     = currentManifesto?.meeting_link || currentManifesto?.manifesto_meeting_link;
  const speakingOrder   = currentManifesto?.speaking_order || [];
  const currentSpeaker  = currentManifesto?.current_speaker || speakingOrder[0] || null;
  const canSpeak = !currentSpeaker || currentSpeaker.user_id === data?.user_id;

  const manifestoClosed =
    data?.election?.status === "voting_open" ||
    data?.election?.is_finalized ||
    Boolean(currentManifesto?.end_time && parseServerTimestamp(currentManifesto.end_time) <= new Date());

  // ── COUNTDOWN TIMER ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!meetingOpen || !currentManifesto?.end_time) return;
    const update = () => {
      const ms = parseServerTimestamp(currentManifesto.end_time).getTime() - Date.now();
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
  }, [meetingOpen, currentManifesto?.end_time]);

  // ── AUTO END: when manifesto time runs out ────────────────────────────────
  useEffect(() => {
    if (!meetingOpen || !currentManifesto?.end_time) return undefined;

    const msUntilEnd = parseServerTimestamp(currentManifesto.end_time).getTime() - Date.now();

    if (msUntilEnd <= 0) {
      handleManifestoEnded();
      return undefined;
    }

    const timer = setTimeout(() => {
      handleManifestoEnded();
    }, msUntilEnd);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingOpen, currentManifesto?.end_time, data?.election_id]);

  const handleManifestoEnded = async () => {
    if (data?.election_id) {
      try {
        await axios.post("/manifesto/leave", { election_id: data.election_id });
      } catch { /* may already be left or session auto-closed */ }
    }
    setMeetingOpen(false);
    setJitsiToken(null);
    setTimeLeft(null);
    // Refresh voting cards now that manifesto ended (manager may have pre-generated them)
    if (data?.election_id) fetchVotingCards(data.election_id);
    setShowThankYou(true);
  };

  // ── JOIN SESSION ──────────────────────────────────────────────────────────
  const handleJoinSession = async () => {
    if (!data?.election_id) return;
    if (manifestoClosed) {
      setMessage("Manifesto session has ended.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await axios.post("/manifesto/join", { election_id: data.election_id });
      setJitsiToken(res.data?.data?.jitsi_token || null);
      setMessage(res.data?.message || "Joined manifesto session");
      setMeetingOpen(true);
      await fetchManifestoSession(data.election_id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to join manifesto session");
    } finally { setBusy(false); }
  };

  // ── LEAVE SESSION ─────────────────────────────────────────────────────────
  const handleLeaveSession = async () => {
    if (!data?.election_id) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await axios.post("/manifesto/leave", { election_id: data.election_id });
      const duration = res.data?.data?.duration_minutes;
      setMessage(`${res.data?.message || "Left manifesto session"}${duration !== undefined ? ` (${duration} minutes)` : ""}`);
      await fetchManifestoSession(data.election_id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to leave manifesto session");
    } finally {
      setBusy(false);
      setMeetingOpen(false);
      setJitsiToken(null);
      setTimeLeft(null);
    }
  };

  // ── THANK YOU SCREEN ──────────────────────────────────────────────────────
  if (showThankYou) {
    return (
      <>
        <style>{styles}</style>
        <div className="thankyou-wrap">
          <div className="thankyou-card">
            <div className="thankyou-icon">🎤</div>
            <h1 className="thankyou-title">Thank You for Participating!</h1>
            <p className="thankyou-sub">
              The manifesto session for <strong style={{ color: "#c8a85a" }}>{data?.election?.title || "this election"}</strong> has ended.
            </p>
            <p className="thankyou-sub">
              Good luck with the results! 
            </p>
            <hr className="thankyou-divider" />
            <p className="thankyou-note">
              Results will be announced once all votes have been counted.
            </p>
            <button
              style={{ marginTop: 28, padding: "12px 28px", background: "linear-gradient(135deg, #c8a85a, #e0c57a)", color: "#0a0e1a", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              onClick={() => setShowThankYou(false)}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── ERROR / LOADING ───────────────────────────────────────────────────────
  if (error) return (
    <>
      <style>{styles}</style>
      <div className="cd-root">
        <div className="cd-inner">
          <p className="cd-page-label">Candidate Portal</p>
          <h2 className="cd-title">My Dashboard</h2>
          <div className="cd-error">{error}</div>
        </div>
      </div>
    </>
  );

  if (!data) return (
    <>
      <style>{styles}</style>
      <div className="cd-root"><p className="cd-loading">Loading your dashboard...</p></div>
    </>
  );

  // ── MAIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="cd-root">
        <div className="cd-inner">
          <p className="cd-page-label">Candidate Portal</p>
          <h2 className="cd-title">My Dashboard</h2>

          <div className="cd-profile-card">
            <div className="cd-avatar">
              {(data.user?.full_name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="cd-name">{data.user.full_name}</div>
              <div className="cd-email">{data.user.email}</div>
            </div>
          </div>

          <div className="cd-grid">
            <div className="cd-stat-card">
              <div className="cd-stat-label">Position</div>
              <div className="cd-stat-value">{data.position?.position_name || "Not assigned"}</div>
            </div>
            <div className="cd-stat-card">
              <div className="cd-stat-label">Election</div>
              <div className="cd-stat-value">{data.election?.title || "Not assigned"}</div>
            </div>
            <div className="cd-stat-card">
              <div className="cd-stat-label">Status</div>
              <div className={`cd-stat-value ${statusClass(data.approval_status)}`}>{data.approval_status}</div>
            </div>
          </div>

          {/* ── MANIFESTO SESSION ── */}
          <div className="cd-section">
            <div className="cd-section-title">Manifesto Session</div>

            {meetingLink ? (
              <>
                <div className="cd-info-row">
                  <span>
                    Scheduled At:{" "}
                    <strong style={{ color: "#f0ece0" }}>
                      {formatDateTime(currentManifesto?.manifesto_scheduled_at || currentManifesto?.start_time) || "Not scheduled"}
                    </strong>
                  </span>
                </div>
                <div className="cd-info-row">
                  <span>
                    Ends At:{" "}
                    <strong style={{ color: "#f0ece0" }}>
                      {formatDateTime(currentManifesto?.end_time) || "—"}
                    </strong>
                  </span>
                </div>

                {manifestoClosed && (
                  <div className="cd-message">
                    ⚠ This manifesto session has ended.
                  </div>
                )}

                {meetingOpen && timeLeft && (
                  <div className="cd-timer">
                    ⏱ Time remaining: <strong style={{ color: "#c8a85a" }}>{timeLeft}</strong>
                  </div>
                )}

                {speakingOrder.length > 0 && (
                  <ul className="cd-order">
                    {speakingOrder.map((speaker) => (
                      <li
                        key={speaker.candidate_id}
                        className={`cd-order-item ${speaker.user_id === currentSpeaker?.user_id ? "cd-order-active" : ""}`}
                      >
                        <span>{speaker.order}. {speaker.full_name}</span>
                        <strong>
                          {speaker.user_id === data.user_id
                            ? "You"
                            : speaker.has_finished
                            ? "Finished"
                            : speaker.user_id === currentSpeaker?.user_id
                            ? "Speaking"
                            : "Waiting"}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="cd-actions">
                  <button
                    className="cd-btn cd-btn-primary"
                    disabled={busy || meetingOpen || manifestoClosed}
                    onClick={handleJoinSession}
                  >
                    {manifestoClosed ? "Session Closed" : busy ? "Joining..." : meetingOpen ? "Session Active" : "Join Manifesto"}
                  </button>
                  <button
                    className="cd-btn cd-btn-secondary"
                    disabled={busy || !meetingOpen}
                    onClick={handleLeaveSession}
                  >
                    Leave Session
                  </button>
                </div>

                {!canSpeak && !meetingOpen && (
                  <div className="cd-message">
                    Your microphone will be muted until your speaking turn.
                  </div>
                )}
                {message && <div className="cd-message">{message}</div>}

                {/* Jitsi embedded meeting */}
                {meetingOpen && jitsiToken && (
                  <div className="cd-meeting">
                    <JitsiMeeting
                      meetingLink={meetingLink}
                      displayName={data.user?.full_name || "Candidate"}
                      userEmail={data.user?.email}
                      jwt={jitsiToken}
                      allowSpeaking={canSpeak}
                      onJoin={() => setMessage("You are in the manifesto session.")}
                      onLeave={handleLeaveSession}
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="cd-empty">No manifesto session scheduled yet.</p>
            )}
          </div>

          {/* ── VOTING CARDS FOR THIS ELECTION ── */}
          {/* Visible to the candidate so they can see their generated ballot card */}
          <div className="cd-section">
            <div className="cd-section-title"> My Voting Card</div>

            {loadingVotingCards ? (
              <p className="cd-voting-loading">Loading voting cards…</p>
            ) : votingCards.length === 0 ? (
              <p className="cd-empty">
                No voting cards have been generated for this election yet.
                The election manager will generate them before voting opens.
              </p>
            ) : (
              <>
                <div className="cd-voting-notice">
                  This is your official generated voting card for <strong style={{ color: "#c8a85a" }}>{votingCards[0]?.election?.title || data.election?.title}</strong>.
                  Voters will see this card when casting their votes.
                </div>
                <div className="cd-voting-grid">
                  {votingCards.map((card) => {
                    const candidate = card.candidate;
                    const photo = candidate?.application?.photo_upload_url;
                    const isMe = Number(candidate?.user?.id) === Number(data.user_id);

                    return (
                      <div
                        key={card.id}
                        className={`cd-voting-card${isMe ? " cd-my-card" : ""}`}
                      >
                        {photo ? (
                          <img
                            src={photo}
                            alt={candidate?.user?.full_name || "Candidate"}
                            className="cd-candidate-photo"
                          />
                        ) : (
                          <div className="cd-candidate-initials">
                            {(candidate?.user?.full_name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="cd-candidate-name">
                            {candidate?.user?.full_name || "Unknown"}
                            {isMe && <span className="cd-you-badge">YOU</span>}
                          </div>
                          <div className="cd-candidate-position">
                            {candidate?.position?.position_name || "—"}
                          </div>
                          <div className="cd-card-code">{card.card_code}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default CandidateDashboard;
