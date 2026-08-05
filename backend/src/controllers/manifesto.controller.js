const asyncHandler = require('../utils/asyncHandler');
const { Op } = require("sequelize");
const generateJitsiToken = require("../utils/jitsiToken");

module.exports = (models) => {
  const { ManifestoSession, ManifestoAttendance, User, Election, Candidate, VoterList } = models;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  
  const parseLocalTimestamp = (value) => {
    if (!value) return new Date(NaN);
    if (value instanceof Date) return value;
    const str = String(value).replace("T", " ").trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[\s](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return new Date(str);
    const [, y, m, d, h, min, s = "00"] = match;
    // new Date(y, m-1, d, h, min, s) creates a LOCAL time Date object — correct
    return new Date(+y, +m - 1, +d, +h, +min, +s);
  };


  const formatTimestampWithoutTimezone = (date) => {
    const pad = (v) => String(v).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  };

  const buildRoomName = (electionId) => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `unielect-election-${electionId}-${suffix}`;
  };

  const buildMeetingLink = (roomName) => {
    const appId = process.env.JAAS_APP_ID;
    return `https://8x8.vc/${appId}/${roomName}`;
  };

  const extractRoomName = (meetingLink) => {
    if (!meetingLink) return null;
    const jaasMatch = meetingLink.match(/8x8\.vc\/[^/]+\/(.+)$/);
    if (jaasMatch) return jaasMatch[1];
    const jitsiMatch = meetingLink.match(/meet\.jit\.si\/(.+)$/);
    if (jitsiMatch) return jitsiMatch[1];
    return meetingLink;
  };

  const attachJwtToLink = (meetingLink, token) => {
    if (!meetingLink || !token) return meetingLink;
    const separator = meetingLink.includes("?") ? "&" : "?";
    return `${meetingLink}${separator}jwt=${encodeURIComponent(token)}`;
  };

  const closeSessionIfEnded = async (session) => {
    if (!session) return false;

    const election = await Election.findByPk(session.election_id);
    if (election?.status === "voting_open" || election?.is_finalized) return true;

    const now = new Date();
    // Use parseLocalTimestamp so DB value is interpreted as local time
    const endTime = parseLocalTimestamp(session.end_time);

    if (Number.isNaN(endTime.getTime()) || endTime > now) return false;

    const activeAttendances = await ManifestoAttendance.findAll({
      where: { election_id: session.election_id, left_at: null }
    });

    for (const attendance of activeAttendances) {
      const durationMinutes = Math.floor((now - new Date(attendance.joined_at)) / 60000);
      await attendance.update({
        left_at: now,
        duration_minutes: durationMinutes,
        is_valid: durationMinutes >= 5
      });
    }

    await Election.update(
      { status: "voting_open" },
      { where: { id: session.election_id } }
    );

    return true;
  };

  // ─── Create / Update Session ───────────────────────────────────────────────

  const createManifestoSession = asyncHandler(async (req, res) => {
    const { election_id, start_time, end_time } = req.body;
    const electionId = Number(election_id);

    if (!electionId || !start_time || !end_time) {
      res.status(400);
      throw new Error("Election, start time, and end time are required");
    }

    const election = await Election.findByPk(electionId);
    if (!election) {
      res.status(404);
      throw new Error("Election not found");
    }

    // Parse as LOCAL time — this is the key fix
    const startAt = parseLocalTimestamp(start_time);
    const endAt = parseLocalTimestamp(end_time);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
      res.status(400);
      throw new Error("End time must be after start time");
    }

    const existing = await ManifestoSession.findOne({ where: { election_id: electionId } });

    const roomName = existing
      ? extractRoomName(existing.meeting_link)
      : buildRoomName(electionId);

    const meetingLink = buildMeetingLink(roomName);

    // Store as plain local timestamp string (no timezone offset)
    const payload = {
      election_id:  electionId,
      meeting_link: meetingLink,
      room_name:    roomName,
      start_time:   formatTimestampWithoutTimezone(startAt),
      end_time:     formatTimestampWithoutTimezone(endAt)
    };

    const session = existing
      ? await existing.update(payload)
      : await ManifestoSession.create(payload);

    await Candidate.update({
      manifesto_meeting_link: session.meeting_link,
      manifesto_scheduled_at: payload.start_time
    }, {
      where: {
        approval_status: "approved",
        [Op.or]: [
          { election_id: electionId },
          { position_id: election.position_id }
        ]
      }
    });

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? "Manifesto session updated" : "Manifesto session created",
      data: session
    });
  });

  // ─── Get Session (with speaking order) ────────────────────────────────────

  const getManifestoSession = asyncHandler(async (req, res) => {
    const { election_id } = req.params;

    const session = await ManifestoSession.findOne({
      where: { election_id },
      include: [{ model: Election, as: "election", attributes: ["id", "title", "position_id", "start_date", "end_date", "status", "is_finalized"] }]
    });

    if (!session) return res.json({ success: true, data: null });

    await closeSessionIfEnded(session);

    const plainSession = session.toJSON();

    const candidates = await Candidate.findAll({
      where: {
        approval_status: "approved",
        [Op.or]: [
          { election_id },
          { position_id: plainSession.election?.position_id || null }
        ]
      },
      include: [{ model: User, as: "user", attributes: ["id", "full_name", "email"] }],
      order: [["id", "ASC"]]
    });

    const candidateUserIds = candidates.map((c) => c.user_id).filter(Boolean);
    const attendances = candidateUserIds.length > 0
      ? await ManifestoAttendance.findAll({
          where: { election_id, user_id: candidateUserIds },
          order: [["id", "DESC"]]
        })
      : [];

    const latestByUser = new Map();
    for (const a of attendances) {
      if (!latestByUser.has(a.user_id)) latestByUser.set(a.user_id, a);
    }

    plainSession.speaking_order = candidates.map((candidate, index) => ({
      order:        index + 1,
      candidate_id: candidate.id,
      user_id:      candidate.user_id,
      full_name:    candidate.user?.full_name || "Candidate",
      email:        candidate.user?.email || null,
      has_finished: Boolean(latestByUser.get(candidate.user_id)?.left_at)
    }));

    plainSession.current_speaker =
      plainSession.speaking_order.find((s) => !s.has_finished) || null;

    res.json({ success: true, data: plainSession });
  });

  // ─── Get My Sessions (voter) ───────────────────────────────────────────────

  const getMyManifestoSessions = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) { res.status(404); throw new Error("User not found"); }

    const email = user.email.trim().toLowerCase();
    const voterEntries = await VoterList.findAll({
      where: {
        [Op.or]: [
          { user_id: user.id },
          { email: { [Op.iLike]: email } }
        ]
      },
      attributes: ["election_id"]
    });

    const electionIds = [...new Set(voterEntries.map((e) => e.election_id).filter(Boolean))];
    if (electionIds.length === 0) return res.json({ success: true, data: [] });

    const sessions = await ManifestoSession.findAll({
      where: { election_id: electionIds },
      include: [{ model: Election, as: "election", attributes: ["id", "title", "position_id", "start_date", "end_date", "status", "is_finalized"] }],
      order: [["start_time", "ASC"]]
    });

    // Close sessions that have ended
    for (const session of sessions) {
      await closeSessionIfEnded(session);
    }

    res.json({ success: true, data: sessions });
  });

  // ─── Delete Session ────────────────────────────────────────────────────────

  const deleteManifestoSession = asyncHandler(async (req, res) => {
    const { election_id } = req.params;

    const session = await ManifestoSession.findOne({ where: { election_id } });
    if (!session) { res.status(404); throw new Error("Manifesto session not found"); }

    const election = await Election.findByPk(election_id);
    await session.destroy();

    await Candidate.update({ manifesto_meeting_link: null, manifesto_scheduled_at: null }, {
      where: {
        [Op.or]: [
          { election_id },
          { position_id: election?.position_id || null }
        ]
      }
    });

    res.json({ success: true, message: "Manifesto session deleted" });
  });

  // ─── Close Session (manager manually closes) ──────────────────────────────

  const closeManifestoSession = asyncHandler(async (req, res) => {
    const { election_id } = req.params;
    const session = await ManifestoSession.findOne({ where: { election_id } });

    if (!session) {
      res.status(404);
      throw new Error("Manifesto session not found");
    }

    const now = new Date();

    // Close all active attendances
    const activeAttendances = await ManifestoAttendance.findAll({
      where: { election_id, left_at: null }
    });

    for (const attendance of activeAttendances) {
      const durationMinutes = Math.floor((now - new Date(attendance.joined_at)) / 60000);
      await attendance.update({
        left_at: now,
        duration_minutes: durationMinutes,
        is_valid: durationMinutes >= 5
      });
    }

    await Election.update(
      { status: "voting_open" },
      { where: { id: election_id } }
    );

    res.json({
      success: true,
      message: "Manifesto session closed. Voting is now available for voters with valid attendance.",
      data: {
        session,
        closed_at: now,
        finalized_attendance: activeAttendances.length
      }
    });
  });

  // ─── Moderator Join Link ───────────────────────────────────────────────────

  const getModeratorJoinLink = asyncHandler(async (req, res) => {
    const electionId = Number(req.params.election_id);
    const session = await ManifestoSession.findOne({ where: { election_id: electionId } });

    if (!session) {
      res.status(404);
      throw new Error("Manifesto session not found");
    }

    const election = await Election.findByPk(electionId);
    const now = new Date();
    // Parse as local time so comparison is correct
    const start = parseLocalTimestamp(session.start_time);
    const end = parseLocalTimestamp(session.end_time);

    if (election?.status === "voting_open" || election?.is_finalized || end <= now) {
      await closeSessionIfEnded(session);
      res.status(403);
      throw new Error("This manifesto session has ended");
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const roomName = session.room_name || extractRoomName(session.meeting_link);
    const token = generateJitsiToken(
      {
        id: user.id,
        name: user.full_name || "Election manager",
        email: user.email,
        context: { user: { moderator: true } }
      },
      roomName,
      true
    );

    res.json({
      success: true,
      data: {
        meeting_link: session.meeting_link,
        moderator_link: attachJwtToLink(session.meeting_link, token),
        jitsi_token: token,
        start_time: session.start_time,
        end_time: session.end_time
      }
    });
  });

  // ─── Join Manifesto (voter / candidate) ───────────────────────────────────

  const joinManifesto = asyncHandler(async (req, res) => {
    const { election_id } = req.body;
    const electionId = Number(election_id);
    const user_id = req.user.id;

    if (!electionId) {
      res.status(400);
      throw new Error("Election ID is required");
    }

    const manifestoSession = await ManifestoSession.findOne({ where: { election_id: electionId } });
    if (!manifestoSession) {
      res.status(404);
      throw new Error("No manifesto session has been created for this election");
    }

    const election = await Election.findByPk(electionId);
    const now = new Date();
    const start = parseLocalTimestamp(manifestoSession.start_time);
    const end = parseLocalTimestamp(manifestoSession.end_time);

    if (election?.status === "voting_open" || election?.is_finalized || end <= now) {
      await closeSessionIfEnded(manifestoSession);
      res.status(403);
      throw new Error("This manifesto session is closed");
    }

    // Removed early join restriction per user request

    const user = await User.findByPk(user_id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const roomName = manifestoSession.room_name || extractRoomName(manifestoSession.meeting_link);

    const jitsiToken = generateJitsiToken(
      {
        id: user.id,
        name: user.full_name,
        email: user.email,
        context: { user: { moderator: false } }
      },
      roomName,
      true
    );

    // Record attendance (idempotent — reuse if already joined)
    const existingAttendance = await ManifestoAttendance.findOne({
      where: { user_id, election_id: electionId, left_at: null },
      order: [["id", "DESC"]]
    });

    const attendance = existingAttendance || await ManifestoAttendance.create({
      user_id,
      election_id: electionId,
      joined_at: new Date()
    });

    res.status(existingAttendance ? 200 : 201).json({
      success: true,
      message: existingAttendance ? "Already joined" : "Joined successfully",
      data: {
        attendance,
        meeting_link: manifestoSession.meeting_link,
        jitsi_token: jitsiToken,
        room_name: roomName,
        start_time: manifestoSession.start_time,
        end_time: manifestoSession.end_time,
        is_moderator: false
      }
    });
  });

  // ─── Leave Manifesto ───────────────────────────────────────────────────────

  const leaveManifesto = asyncHandler(async (req, res) => {
    const { election_id } = req.body;
    const electionId = Number(election_id);
    const user_id = req.user.id;

    if (!electionId) {
      res.status(400);
      throw new Error("Election ID is required");
    }

    const attendance = await ManifestoAttendance.findOne({
      where: { user_id, election_id: electionId },
      order: [["id", "DESC"]]
    });

    if (!attendance) { res.status(404); throw new Error("No active manifesto session found"); }
    if (attendance.left_at) { res.status(400); throw new Error("Session already ended"); }

    const leftAt = new Date();
    const durationMinutes = Math.floor((leftAt - new Date(attendance.joined_at)) / 60000);
    const isValid = durationMinutes >= 5;

    await attendance.update({ left_at: leftAt, duration_minutes: durationMinutes, is_valid: isValid });

    res.json({
      success: true,
      message: "Left manifesto session",
      data: {
        attendance,
        left_at: leftAt,
        duration_minutes: durationMinutes,
        is_valid: isValid
      }
    });
  });

  // ─── Check Attendance ──────────────────────────────────────────────────────

  const checkManifestoAttendance = asyncHandler(async (req, res) => {
    const { election_id } = req.params;
    const attended = await ManifestoAttendance.findOne({
      where: { user_id: req.user.id, election_id, is_valid: true }
    });
    res.json({ success: true, attended: !!attended });
  });

  // ─── Get All Attendances (manager view) ────────────────────────────────────

  const getAllManifestoSessions = asyncHandler(async (req, res) => {
    const { election_id } = req.params;
    const sessions = await ManifestoAttendance.findAll({
      where: { election_id },
      include: [{ model: User, as: "user", attributes: ["full_name", "email"] }],
      order: [["joined_at", "DESC"]]
    });
    res.json({ success: true, data: sessions });
  });

  return {
    createManifestoSession,
    getManifestoSession,
    getMyManifestoSessions,
    deleteManifestoSession,
    closeManifestoSession,
    getModeratorJoinLink,
    joinManifesto,
    leaveManifesto,
    checkManifestoAttendance,
    getAllManifestoSessions
  };
};