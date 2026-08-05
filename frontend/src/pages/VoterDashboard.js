import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import JitsiMeeting from "../components/JitsiMeeting";

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .vd-root { min-height: 100vh; background: #0a0e1a; padding: 40px 24px; font-family: 'DM Sans', sans-serif; color: #f0ece0; }
  .vd-inner { max-width: 900px; margin: 0 auto; }
  .vd-badge { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #c8a85a; margin-bottom: 10px; }
  .vd-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f0ece0; margin-bottom: 28px; }
  .vd-section { background: #11162a; border: 1px solid rgba(200,168,90,0.15); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .vd-section-title { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8a85a; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,168,90,0.15); }
  .vd-profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .vd-profile-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(200,168,90,0.1); border-radius: 8px; padding: 12px; }
  .vd-profile-label { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: rgba(240,236,224,0.4); margin-bottom: 5px; }
  .vd-profile-value { font-size: 14px; color: #f0ece0; font-weight: 500; }

  /* Manifesto sessions */
  .vd-session-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(200,168,90,0.15); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .vd-session-election { font-family: 'Playfair Display', serif; font-size: 16px; color: #f0ece0; margin-bottom: 6px; }
  .vd-session-meta { font-size: 12px; color: rgba(240,236,224,0.45); margin-bottom: 12px; line-height: 1.6; }
  .vd-session-status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 10px; }
  .vd-status-live { background: rgba(93,220,138,0.15); color: #5ddc8a; }
  .vd-status-scheduled { background: rgba(200,168,90,0.15); color: #c8a85a; }
  .vd-status-closed { background: rgba(220,50,50,0.12); color: #ff7070; }
  .vd-status-voting { background: rgba(105,185,160,0.15); color: #7ee0c4; }
  .vd-btn { border: none; border-radius: 8px; padding: 9px 16px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .vd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .vd-btn-primary { background: linear-gradient(135deg, #c8a85a, #e0c57a); color: #0a0e1a; }
  .vd-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(200,168,90,0.35); }
  .vd-btn-secondary { background: rgba(105,185,160,0.1); color: #7ee0c4; border: 1px solid rgba(105,185,160,0.25); }
  .vd-btn-secondary:hover:not(:disabled) { background: rgba(105,185,160,0.2); }
  .vd-btn-danger { background: rgba(220,50,50,0.1); color: #ff7070; border: 1px solid rgba(220,50,50,0.2); }
  .vd-btn-danger:hover:not(:disabled) { background: rgba(220,50,50,0.2); }
  .vd-timer { font-size: 13px; color: rgba(200,168,90,0.8); margin-top: 8px; }

  .vd-notice { font-size: 13px; color: rgba(240,236,224,0.5); background: rgba(200,168,90,0.06); border: 1px solid rgba(200,168,90,0.12); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; line-height: 1.6; }
  .vd-meeting-wrap { margin-top: 16px; overflow: hidden; border-radius: 10px; border: 1px solid rgba(200,168,90,0.2); }

  /* Voting ballot */
  .vd-ballot-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
  .vd-ballot-election-name { font-family: 'Playfair Display', serif; font-size: 18px; color: #f0ece0; }
  .vd-ballot-status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-voted { background: rgba(93,220,138,0.15); color: #5ddc8a; }
  .badge-vote-now { background: rgba(105,185,160,0.15); color: #7ee0c4; }
  .badge-no-attendance { background: rgba(220,50,50,0.12); color: #ff7070; }
  .badge-not-open { background: rgba(200,168,90,0.12); color: #c8a85a; }
  .vd-ballot-hint { font-size: 12px; color: rgba(240,236,224,0.4); margin-bottom: 16px; }

  /* Candidate voting cards grid */
  .vd-candidate-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .vd-candidate-card { background: rgba(255,255,255,0.035); border: 2px solid rgba(200,168,90,0.15); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
  .vd-candidate-card:hover { border-color: rgba(200,168,90,0.35); transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.4); }
  .vd-candidate-card.voted-card { border-color: rgba(93,220,138,0.5); background: rgba(93,220,138,0.03); }
  .vd-candidate-photo-wrap { width: 100%; aspect-ratio: 1/1; overflow: hidden; background: rgba(200,168,90,0.06); display: flex; align-items: center; justify-content: center; }
  .vd-candidate-photo { width: 100%; height: 100%; object-fit: cover; }
  .vd-candidate-initials { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #c8a85a; opacity: 0.6; }
  .vd-candidate-body { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .vd-candidate-name { font-size: 14px; font-weight: 600; color: #f0ece0; }
  .vd-candidate-position { font-size: 12px; color: rgba(200,168,90,0.85); }
  .vd-card-code { font-size: 10px; color: rgba(240,236,224,0.25); font-family: monospace; margin-top: 4px; }
  .vd-vote-btn { width: 100%; padding: 12px 0; border: none; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; text-align: center; border-top: 1px solid rgba(200,168,90,0.1); }
  .vd-vote-btn-active { background: linear-gradient(135deg, #7ee0c4, #5ddc8a); color: #0a0e1a; }
  .vd-vote-btn-active:hover:not(:disabled) { filter: brightness(1.08); }
  .vd-vote-btn-voted { background: rgba(93,220,138,0.15); color: #5ddc8a; cursor: default; }
  .vd-vote-btn-disabled { background: rgba(255,255,255,0.04); color: rgba(240,236,224,0.2); cursor: not-allowed; }

  .vd-error { color: #ff9a9a; background: rgba(220,50,50,0.1); border: 1px solid rgba(220,50,50,0.3); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; font-size: 13px; }
  .vd-success { color: #7ee0c4; background: rgba(105,185,160,0.1); border: 1px solid rgba(105,185,160,0.3); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; font-size: 13px; }
  .vd-empty { color: rgba(240,236,224,0.3); font-size: 14px; font-style: italic; }
  .vd-loading { color: rgba(240,236,224,0.35); font-size: 14px; padding: 16px 0; }

  @media (max-width: 640px) { .vd-root { padding: 24px 14px; } .vd-candidate-grid { grid-template-columns: 1fr; } .vd-profile-grid { grid-template-columns: 1fr 1fr; } }
`;

function VoterDashboard() {
  const location = useLocation();
  const isDashboard = location.pathname === "/voter";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manifestoSessions, setManifestoSessions] = useState([]);

  // Active Jitsi meeting
  const [activeManifesto, setActiveManifesto] = useState(null);
  const [loadingManifestoId, setLoadingManifestoId] = useState(null);
  const [manifestoTimer, setManifestoTimer] = useState(null);

  // Voting state
  // showVotingPage is triggered automatically after leaving manifesto, OR manually
  const [showVotingPage, setShowVotingPage] = useState(false);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [votesByElection, setVotesByElection] = useState({});
  const [attendanceByElection, setAttendanceByElection] = useState({});
  const [votingCandidateId, setVotingCandidateId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Read-only card preview (dashboard tab)
  const [showReadOnlyCards, setShowReadOnlyCards] = useState(false);
  const [readOnlyCards, setReadOnlyCards] = useState([]);
  const [loadingReadOnly, setLoadingReadOnly] = useState(false);

  // ── HELPERS ───────────────────────────────────────────────────────────────
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

  const isSessionClosed = (session) =>
    session?.election?.status === "voting_open" ||
    session?.election?.is_finalized ||
    Boolean(session?.end_time && parseServerTimestamp(session.end_time) <= new Date());

  const getSessionStatus = (session) => {
    if (isSessionClosed(session)) {
      if (session?.election?.status === "voting_open") return "voting";
      return "closed";
    }
    const now = new Date();
    const start = parseServerTimestamp(session.start_time);
    if (start <= now) return "live";
    return "scheduled";
  };

  // ── FETCH PROFILE ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/voter/me");
        const data = res.data?.data || null;
        setProfile(data);
        setManifestoSessions(data?.manifesto_sessions || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── LOAD VOTING DATA ──────────────────────────────────────────────────────
  const loadVotingPage = async () => {
    setLoadingCards(true);
    setError("");
    try {
      const res = await axios.get("/voting-cards/voter");
      const nextCards = res.data?.data || [];
      setCards(nextCards);

      const electionIds = [...new Set(nextCards.map((c) => c.election_id).filter(Boolean))];

      const [voteEntries, attendanceEntries] = await Promise.all([
        Promise.all(electionIds.map(async (electionId) => {
          try {
            const r = await axios.get(`/votes/my/${electionId}`);
            return [electionId, r.data?.data || null];
          } catch { return [electionId, null]; }
        })),
        Promise.all(electionIds.map(async (electionId) => {
          try {
            const r = await axios.get(`/manifesto/status/${electionId}`);
            return [electionId, Boolean(r.data?.attended)];
          } catch { return [electionId, false]; }
        }))
      ]);

      setVotesByElection(Object.fromEntries(voteEntries));
      setAttendanceByElection(Object.fromEntries(attendanceEntries));
    } catch (err) {
      console.error(err);
      setError("Failed to load voting ballot.");
    } finally {
      setLoadingCards(false);
    }
  };

  // ── LOAD READ-ONLY CARDS (dashboard preview — no vote) ────────────────────
  const loadReadOnlyCards = async () => {
    setLoadingReadOnly(true);
    try {
      const res = await axios.get("/voting-cards/voter");
      setReadOnlyCards(res.data?.data || []);
      setShowReadOnlyCards(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load voting cards.");
    } finally {
      setLoadingReadOnly(false);
    }
  };

  // Group read-only cards by election
  const groupedReadOnly = readOnlyCards.reduce((acc, card) => {
    const eid = card.election_id || card.election?.id || "unknown";
    if (!acc[eid]) acc[eid] = { election: card.election || { id: eid, title: `Election ${eid}` }, cards: [] };
    acc[eid].cards.push(card);
    return acc;
  }, {});

  // ── JOIN MANIFESTO ────────────────────────────────────────────────────────
  const participateInManifesto = async (session) => {
    if (!session?.election_id || !session?.meeting_link) return;
    if (isSessionClosed(session)) {
      setError("This manifesto session has ended. Please check the voting section below.");
      return;
    }
    setLoadingManifestoId(session.election_id);
    setError("");
    setMessage("");
    try {
      const res = await axios.post("/manifesto/join", { election_id: session.election_id });
      const data = res.data?.data || {};
      setActiveManifesto({
        ...session,
        meeting_link: data.meeting_link || session.meeting_link,
        jitsi_token: data.jitsi_token || null,
        end_time: data.end_time || session.end_time
      });
      setMessage(`You joined the manifesto session for "${session.election?.title}". Stay for 5+ minutes to get valid attendance.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join manifesto session");
    } finally {
      setLoadingManifestoId(null);
    }
  };

  // ── LEAVE MANIFESTO ───────────────────────────────────────────────────────
  const trackManifestoLeave = async (session) => {
    if (!session?.election_id) return;
    setLoadingManifestoId(session.election_id);
    try {
      const res = await axios.post("/manifesto/leave", { election_id: session.election_id });
      const duration = res.data?.data?.duration_minutes;
      const valid = res.data?.data?.is_valid;
      setMessage(
        `Left manifesto session${duration !== undefined
          ? ` (${duration} min — attendance ${valid ? "✅ valid" : "❌ not valid, needed 5+ min"})`
          : ""}.`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave manifesto session");
    } finally {
      setLoadingManifestoId(null);
      setActiveManifesto(null);
      setManifestoTimer(null);
      // After leaving manifesto → automatically open the voting page
      await loadVotingPage();
      setShowVotingPage(true);
    }
  };

  // ── AUTO END: when manifesto time runs out ────────────────────────────────
  useEffect(() => {
    if (!activeManifesto?.end_time) return undefined;

    const msUntilEnd = parseServerTimestamp(activeManifesto.end_time).getTime() - Date.now();

    if (msUntilEnd <= 0) {
      handleManifestoEnded(activeManifesto);
      return undefined;
    }

    // Live countdown
    const countdownInterval = setInterval(() => {
      const ms = parseServerTimestamp(activeManifesto.end_time).getTime() - Date.now();
      if (ms <= 0) {
        setManifestoTimer(null);
        clearInterval(countdownInterval);
      } else {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n) => String(n).padStart(2, "0");
        setManifestoTimer(h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`);
      }
    }, 1000);

    const endTimer = setTimeout(() => {
      handleManifestoEnded(activeManifesto);
    }, msUntilEnd);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(endTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeManifesto?.id, activeManifesto?.end_time]);

  const handleManifestoEnded = async (session) => {
    if (session?.election_id) {
      try {
        await axios.post("/manifesto/leave", { election_id: session.election_id });
      } catch { /* may already be left */ }
    }
    setActiveManifesto(null);
    setManifestoTimer(null);
    setMessage("The manifesto session has ended. Loading your voting ballot…");
    // Auto-navigate to voting page
    await loadVotingPage();
    setShowVotingPage(true);
  };

  // ── CAST VOTE ─────────────────────────────────────────────────────────────
  const castVote = async (card) => {
    if (!card?.candidate_id || !card?.election_id) return;
    if (!window.confirm("Cast your vote for this candidate? This cannot be changed.")) return;

    setVotingCandidateId(card.candidate_id);
    setError("");
    setMessage("");
    try {
      const res = await axios.post("/votes/cast", {
        election_id: card.election_id,
        candidate_id: card.candidate_id
      });
      setVotesByElection((prev) => ({
        ...prev,
        [card.election_id]: res.data?.data || { candidate_id: card.candidate_id }
      }));
      setMessage(res.data?.message || "Vote cast successfully! 🎉");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cast vote");
    } finally {
      setVotingCandidateId(null);
    }
  };

  // ── GROUP CARDS BY ELECTION ───────────────────────────────────────────────
  const groupedCards = cards.reduce((groups, card) => {
    const electionId = card.election_id || card.election?.id || "unknown";
    if (!groups[electionId]) {
      groups[electionId] = {
        election: card.election || { id: electionId, title: `Election ${electionId}` },
        cards: []
      };
    }
    groups[electionId].cards.push(card);
    return groups;
  }, {});

  // ── RENDER: LOADING ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vd-root">
        <style>{cssStyles}</style>
        <div className="vd-inner">
          <p className="vd-loading">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── RENDER: VOTING PAGE ───────────────────────────────────────────────────
  if (showVotingPage) {
    return (
      <>
        <style>{cssStyles}</style>
        <div className="vd-root">
          <div className="vd-inner">
            <p className="vd-badge">Voter Portal</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <h2 className="vd-title" style={{ marginBottom: 0 }}>🗳 Voting Ballot</h2>
              <button className="vd-btn vd-btn-secondary" onClick={() => setShowVotingPage(false)}>
                ← Back to Dashboard
              </button>
            </div>

            {error && <div className="vd-error">{error}</div>}
            {message && <div className="vd-success">{message}</div>}

            {loadingCards ? (
              <p className="vd-loading">Loading your ballot…</p>
            ) : cards.length === 0 ? (
              <div className="vd-section">
                <p className="vd-empty">No voting cards are available yet.</p>
                <p style={{ fontSize: 13, color: "rgba(240,236,224,0.4)", marginTop: 8 }}>
                  The election manager needs to generate voting cards. Please check back after the manifesto session.
                </p>
              </div>
            ) : (
              Object.values(groupedCards).map((group) => {
                const electionId = Number(group.election.id);
                const vote = votesByElection[electionId];
                const hasVoted = Boolean(vote);
                const hasValidAttendance = Boolean(attendanceByElection[electionId]);
                // Voting is open when election status is voting_open or is_finalized is false
                const votingOpen = group.election?.status === "voting_open" || group.cards.some(() => true);
                const canVoteInElection = votingOpen && hasValidAttendance && !hasVoted;

                let statusLabel, statusClass;
                if (hasVoted) {
                  statusLabel = "Vote Submitted";
                  statusClass = "badge-voted";
                } else if (!votingOpen) {
                  statusLabel = "Not Open Yet";
                  statusClass = "badge-not-open";
                } else if (!hasValidAttendance) {
                  statusLabel = " No Valid Attendance";
                  statusClass = "badge-no-attendance";
                } else {
                  statusLabel = " Vote Now";
                  statusClass = "badge-vote-now";
                }

                return (
                  <div key={electionId} className="vd-section">
                    <div className="vd-ballot-header">
                      <div className="vd-ballot-election-name">{group.election.title || `Election ${electionId}`}</div>
                      <span className={`vd-ballot-status-badge ${statusClass}`}>{statusLabel}</span>
                    </div>

                    {!votingOpen && (
                      <p className="vd-ballot-hint">Voting opens after the manifesto time ends.</p>
                    )}
                    {votingOpen && !hasValidAttendance && !hasVoted && (
                      <p className="vd-ballot-hint" style={{ color: "rgba(255,112,112,0.8)" }}>
                        You need valid manifesto attendance (5+ minutes) to cast a vote.
                      </p>
                    )}
                    {canVoteInElection && (
                      <p className="vd-ballot-hint" style={{ color: "rgba(126,224,196,0.8)" }}>
                        Select one candidate and click Vote. You cannot change your vote after submitting.
                      </p>
                    )}

                    <div className="vd-candidate-grid">
                      {group.cards.map((card) => {
                        const candidate = card.candidate;
                        const photo = candidate?.application?.photo_upload_url;
                        const initials = (candidate?.user?.full_name || "?").charAt(0).toUpperCase();
                        const thisCandidateVoted = Number(vote?.candidate_id) === Number(card.candidate_id);
                        const canVoteThisCard = canVoteInElection && !votingCandidateId;

                        let voteBtnClass = "vd-vote-btn ";
                        let voteBtnLabel;
                        if (votingCandidateId === card.candidate_id) {
                          voteBtnClass += "vd-vote-btn-active";
                          voteBtnLabel = "Voting…";
                        } else if (thisCandidateVoted) {
                          voteBtnClass += "vd-vote-btn-voted";
                          voteBtnLabel = "✓ Voted";
                        } else if (!canVoteThisCard) {
                          voteBtnClass += "vd-vote-btn-disabled";
                          voteBtnLabel = hasVoted ? "Closed" : "Vote";
                        } else {
                          voteBtnClass += "vd-vote-btn-active";
                          voteBtnLabel = "🗳 Vote";
                        }

                        return (
                          <article
                            key={card.id}
                            className={`vd-candidate-card${thisCandidateVoted ? " voted-card" : ""}`}
                          >
                            {/* Photo */}
                            <div className="vd-candidate-photo-wrap">
                              {photo ? (
                                <img
                                  src={photo}
                                  alt={candidate?.user?.full_name || "Candidate"}
                                  className="vd-candidate-photo"
                                />
                              ) : (
                                <span className="vd-candidate-initials">{initials}</span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="vd-candidate-body">
                              <div className="vd-candidate-name">{candidate?.user?.full_name || "Candidate"}</div>
                              <div className="vd-candidate-position">{candidate?.position?.position_name || "—"}</div>
                              <div className="vd-card-code">{card.card_code}</div>
                            </div>

                            {/* Vote button at the bottom */}
                            <button
                              className={voteBtnClass}
                              disabled={!canVoteThisCard || thisCandidateVoted}
                              onClick={() => castVote(card)}
                            >
                              {voteBtnLabel}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </>
    );
  }

  // ── RENDER: VOTE MAIN (simplified — only the View Voting Card button + vote) ──
  if (!isDashboard) {
    return (
      <>
        <style>{cssStyles}</style>
        <div className="vd-root">
          <div className="vd-inner">
            <p className="vd-badge">Voter Portal</p>
            <h2 className="vd-title">🗳 My Voting Card</h2>

            {error && <div className="vd-error">{error}</div>}
            {message && <div className="vd-success">{message}</div>}

            {/* ── Single action: View Voting Card ── */}
            <div className="vd-section" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎫</div>
              <p style={{ fontSize: 15, color: "rgba(240,236,224,0.55)", marginBottom: 28, maxWidth: 420, margin: "0 auto 28px" }}>
                Click below to view your ballot. You can cast your vote after the manifesto time ends.
              </p>
              <button
                className="vd-btn vd-btn-primary"
                style={{ fontSize: 15, padding: "13px 36px" }}
                onClick={async () => { await loadVotingPage(); setShowVotingPage(true); }}
                disabled={loadingCards}
              >
                {loadingCards ? "Loading…" : "View Voting Card"}
              </button>
            </div>

          </div>
        </div>
      </>
    );
  }

  // ── RENDER: DASHBOARD (profile + read-only card preview) ──────────────────
  return (
    <>
      <style>{cssStyles}</style>
      <div className="vd-root">
        <div className="vd-inner">
          <p className="vd-badge">Voter Portal</p>
          <h2 className="vd-title">Voter Dashboard</h2>

          {error && <div className="vd-error">{error}</div>}
          {message && <div className="vd-success">{message}</div>}

          {/* ── PROFILE ── */}
          <div className="vd-section">
            <div className="vd-section-title">Your Profile</div>
            <div className="vd-profile-grid">
              {[
                ["Full Name", profile?.full_name],
                ["Email", profile?.email],
                ["Phone", profile?.phone_number],
                ["Department", profile?.department],
                ["Faculty", profile?.faculty],
                ["Job Title", profile?.job_title]
              ].map(([label, value]) => (
                <div key={label} className="vd-profile-item">
                  <div className="vd-profile-label">{label}</div>
                  <div className="vd-profile-value">{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ELECTIONS SUMMARY ── */}
          {manifestoSessions.length > 0 && (
            <div className="vd-section">
              <div className="vd-section-title">📋 Your Elections</div>
              {manifestoSessions.map((session) => {
                const sessionStatus = getSessionStatus(session);
                return (
                  <div key={session.id} className="vd-session-card">
                    <div className="vd-session-election">{session.election?.title || `Election ${session.election_id}`}</div>
                    <div>
                      {sessionStatus === "live" && <span className="vd-session-status vd-status-live">🔴 LIVE NOW</span>}
                      {sessionStatus === "scheduled" && <span className="vd-session-status vd-status-scheduled">⏰ Scheduled</span>}
                      {sessionStatus === "closed" && <span className="vd-session-status vd-status-closed">Ended</span>}
                      {sessionStatus === "voting" && <span className="vd-session-status vd-status-voting">✅ Voting Open</span>}
                    </div>
                    <div className="vd-session-meta">
                      Start: {formatDateTime(session.start_time)}<br />
                      End: {formatDateTime(session.end_time)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── VIEW VOTING CARD (read-only) ── */}
          <div className="vd-section">
            <div className="vd-section-title">🎫 Voting Card Preview</div>
            <p style={{ fontSize: 13, color: "rgba(240,236,224,0.45)", marginBottom: 18 }}>
              View the candidates on your ballot. To cast your vote, use the <strong style={{ color: "#c8a85a" }}>Vote</strong> tab from the sidebar.
            </p>

            {!showReadOnlyCards ? (
              <button
                className="vd-btn vd-btn-primary"
                onClick={loadReadOnlyCards}
                disabled={loadingReadOnly}
              >
                {loadingReadOnly ? "Loading…" : "View Voting Card"}
              </button>
            ) : readOnlyCards.length === 0 ? (
              <p className="vd-empty">No voting cards available yet. The manager needs to generate them.</p>
            ) : (
              Object.values(groupedReadOnly).map((group) => (
                <div key={group.election.id} style={{ marginBottom: 24 }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 16, color: "#f0ece0",
                    marginBottom: 14, paddingBottom: 10,
                    borderBottom: "1px solid rgba(200,168,90,0.15)"
                  }}>
                    {group.election.title || `Election ${group.election.id}`}
                  </div>
                  <div className="vd-candidate-grid">
                    {group.cards.map((card) => {
                      const candidate = card.candidate;
                      const photo = candidate?.application?.photo_upload_url;
                      const initials = (candidate?.user?.full_name || "?").charAt(0).toUpperCase();
                      return (
                        <article key={card.id} className="vd-candidate-card">
                          {/* Photo */}
                          <div className="vd-candidate-photo-wrap">
                            {photo ? (
                              <img
                                src={photo}
                                alt={candidate?.user?.full_name || "Candidate"}
                                className="vd-candidate-photo"
                              />
                            ) : (
                              <span className="vd-candidate-initials">{initials}</span>
                            )}
                          </div>
                          {/* Info only — no vote button */}
                          <div className="vd-candidate-body">
                            <div className="vd-candidate-name">{candidate?.user?.full_name || "Candidate"}</div>
                            <div className="vd-candidate-position">{candidate?.position?.position_name || "—"}</div>
                            <div className="vd-card-code">{card.card_code}</div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default VoterDashboard;
