// controllers/vote.controller.js
const asyncHandler = require('../utils/asyncHandler');

module.exports = (models) => {
  const { Vote, VoterList, ManifestoAttendance, ManifestoSession, Candidate, Election } = models;

  const parseLocalTimestamp = (value) => {
    if (!value) return new Date(NaN);
    if (value instanceof Date) return value;
    const str = String(value).replace("T", " ").trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[\s](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return new Date(str);
    const [, y, m, d, h, min, s = "00"] = match;
    return new Date(+y, +m - 1, +d, +h, +min, +s);
  };

  const getScheduledManifestoEndTime = async (manifestoSession) => {
    if (!manifestoSession) return new Date(NaN);

    const [rows] = await ManifestoSession.sequelize.query(
      `SELECT to_char(end_time, 'YYYY-MM-DD HH24:MI:SS') AS end_time
       FROM manifesto_sessions
       WHERE election_id = :electionId
       LIMIT 1`,
      { replacements: { electionId: manifestoSession.election_id } }
    );

    return parseLocalTimestamp(rows?.[0]?.end_time || manifestoSession.end_time);
  };

  const closeExpiredManifesto = async (manifestoSession, scheduledEndTime = null) => {
    if (!manifestoSession) return false;
    const endTime = scheduledEndTime || await getScheduledManifestoEndTime(manifestoSession);
    if (endTime > new Date()) return false;

    const activeAttendances = await ManifestoAttendance.findAll({
      where: { election_id: manifestoSession.election_id, left_at: null }
    });

    const now = new Date();
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
      { where: { id: manifestoSession.election_id } }
    );

    return true;
  };

  // Cast Vote
  const castVote = asyncHandler(async (req, res) => {
    const voter_id = req.user.id;
    const { election_id, candidate_id } = req.body;

    const election = await Election.findByPk(election_id);
    if (!election) {
      res.status(404);
      throw new Error("Election not found");
    }

    if (election.is_finalized) {
      res.status(403);
      throw new Error("Election is finalized. Voting is closed.");
    }

    const manifestoSession = await ManifestoSession.findOne({ where: { election_id } });
    if (!manifestoSession) {
      res.status(403);
      throw new Error("Voting is locked until a manifesto session is created and closed.");
    }

    const endTime = await getScheduledManifestoEndTime(manifestoSession);
    const now = new Date();
    
    // Add a 10-second buffer to handle small clock drifts between client and server
    const bufferMs = 10000; 
    const isEnded = (endTime.getTime() - now.getTime()) <= bufferMs;

    if (!isEnded) {
      console.log(`[VOTE] Forbidden: Manifesto not ended. EndTime: ${endTime.toISOString()}, Now: ${now.toISOString()}, Diff: ${endTime - now}ms`);
      res.status(403);
      throw new Error("Voting opens after the manifesto time ends.");
    }

    if (election.status !== "voting_open") {
      await closeExpiredManifesto(manifestoSession, endTime);
    }


    // 1. Check if voter is in the voter list
    const voterCheck = await VoterList.findOne({
      where: { election_id, user_id: voter_id }
    });

    if (!voterCheck) {
      res.status(403);
      throw new Error("You are not allowed to vote in this election");
    }

    // 2. Check manifesto attendance (must be valid)
    const manifestoCheck = await ManifestoAttendance.findOne({
      where: {
        user_id: voter_id,
        election_id,
        is_valid: true
      }
    });

    if (!manifestoCheck) {
      res.status(403);
      throw new Error("You must attend the manifesto session (min 5 minutes) before voting");
    }

    // 3. Check if already voted
    const alreadyVoted = await Vote.findOne({
      where: { voter_id, election_id }
    });

    if (alreadyVoted) {
      res.status(400);
      throw new Error("You have already voted in this election");
    }

    // 4. Validate candidate
    const candidateCheck = await Candidate.findOne({
      where: { id: candidate_id, election_id, approval_status: "approved" }
    });
    if (!candidateCheck) {
      res.status(404);
      throw new Error("Invalid candidate for this election");
    }

    // 5. Cast the vote
    const vote = await Vote.create({
      voter_id,
      election_id,
      candidate_id
    });

    res.status(201).json({
      success: true,
      message: "Vote cast successfully",
      data: vote
    });
  });

  // Get My Vote
  const getMyVote = asyncHandler(async (req, res) => {
    const voter_id = req.user.id;
    const { election_id } = req.params;

    const vote = await Vote.findOne({
      where: { voter_id, election_id },
      include: [
        { model: Candidate, as: 'candidate' }
      ]
    });

    res.json({
      success: true,
      data: vote || null
    });
  });

  return {
    castVote,
    getMyVote
  };
};
