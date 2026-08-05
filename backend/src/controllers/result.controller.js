// controllers/result.controller.js
const asyncHandler = require('../utils/asyncHandler');

module.exports = (models) => {
  const { Election, Candidate, User, Vote, Position, Application } = models;

  // ── FINALIZE ELECTION ─────────────────────────────────────────────────────
  const finalizeElection = asyncHandler(async (req, res) => {
    const { election_id } = req.params;

    const election = await Election.findByPk(election_id);
    if (!election) { res.status(404); throw new Error('Election not found'); }
    if (election.is_finalized) { res.status(400); throw new Error('Election is already finalized'); }

    const voteCounts = await Vote.findAll({
      where: { election_id },
      attributes: [
        'candidate_id',
        [Vote.sequelize.fn('COUNT', Vote.sequelize.col('id')), 'vote_count']
      ],
      group: ['candidate_id'],
      order: [[Vote.sequelize.literal('vote_count'), 'DESC']],
      raw: true
    });

    const winnerCandidateId = voteCounts.length > 0 ? voteCounts[0].candidate_id : null;

    // ── UPDATE POSITION HOLDER ──────────────────────────────────────────────
    if (winnerCandidateId) {
      const winner = await Candidate.findByPk(winnerCandidateId, {
        include: [{ model: User, as: 'user', attributes: ['full_name'] }]
      });

      if (winner && winner.user) {
        const position = await Position.findByPk(election.position_id);
        if (position) {
          // Calculate remaining years to add to the next tenure
          const remaining = parseFloat(position.years_remaining) || 0;
          const newTenure = (position.tenure_years || 0) + Math.round(remaining);

          // Update the position with the new holder and updated tenure
          await position.update({
            currently_assigned_person: winner.user.full_name,
            assigned_date: new Date(),
            tenure_years: newTenure
          });

          // ── CLOSE ASSOCIATED VACANCY ─────────────────────────────────────
          const { Vacancy } = models;
          await Vacancy.update(
            { status: 'closed' },
            { where: { position_id: election.position_id, status: 'open' } }
          );
        }
      }
    }

    await election.update({
      status: 'finalized',
      is_finalized: true,
      winner_candidate_id: winnerCandidateId,
      finalized_at: new Date()
    });

    res.json({
      success: true,
      message: "Election finalized successfully and position holder updated",
      winner_candidate_id: winnerCandidateId,
      total_votes: voteCounts.reduce((sum, c) => sum + parseInt(c.vote_count), 0)
    });
  });

  // ── GET FINALIZED RESULT ──────────────────────────────────────────────────
  const getFinalizedResult = asyncHandler(async (req, res) => {
    const { election_id } = req.params;

    const election = await Election.findByPk(election_id, {
      include: [
        {
          model: Candidate,
          as: 'winner',
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        }
      ]
    });

    if (!election) { res.status(404); throw new Error('Election not found'); }
    res.json({ success: true, data: election });
  });

  // ── LIVE RESULTS (vote counts per candidate, real-time) ───────────────────
  const getLiveResults = asyncHandler(async (req, res) => {
    const { election_id } = req.params;

    const election = await Election.findByPk(election_id);
    if (!election) { res.status(404); throw new Error('Election not found'); }

    // Get all approved candidates with user + position + application photo
    const candidates = await Candidate.findAll({
      where: { election_id, approval_status: 'approved' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { model: Position, as: 'position', attributes: ['position_name'] },
        { model: Application, as: 'application', attributes: ['photo_upload'] }
      ]
    });

    // Count votes per candidate
    const voteCounts = await Vote.findAll({
      where: { election_id },
      attributes: [
        'candidate_id',
        [Vote.sequelize.fn('COUNT', Vote.sequelize.col('id')), 'vote_count']
      ],
      group: ['candidate_id'],
      raw: true
    });

    const voteMap = {};
    voteCounts.forEach(r => { voteMap[r.candidate_id] = parseInt(r.vote_count); });
    const totalVotes = voteCounts.reduce((sum, r) => sum + parseInt(r.vote_count), 0);

    const hostUrl = `${req.protocol}://${req.get('host')}`;

    const rows = candidates
      .map(c => {
        const plain = c.toJSON();
        const votes = voteMap[plain.id] || 0;
        const rawPercent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
        // Convert raw vote % to 30% scale
        const convertedScore = totalVotes > 0 ? (votes / totalVotes) * 30 : 0;

        // Build photo URL
        const rawPhoto = plain.application?.photo_upload;
        let photoUrl = null;
        if (rawPhoto) {
          if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) {
            photoUrl = rawPhoto;
          } else {
            const cleanPath = rawPhoto.replace(/^\/+/, '').replace(/^uploads\/+/, '');
            photoUrl = `${hostUrl}/uploads/${cleanPath}`;
          }
        }

        return {
          candidate_id: plain.id,
          full_name: plain.user?.full_name || 'Unknown',
          email: plain.user?.email || '',
          position: plain.position?.position_name || '\u2014',
          photo_url: photoUrl,
          votes,
          vote_percent: Math.round(rawPercent * 10) / 10,
          converted_score: Math.round(convertedScore * 10) / 10,
          is_winner: election.is_finalized && Number(election.winner_candidate_id) === Number(plain.id)
        };
      })
      .sort((a, b) => b.votes - a.votes);

    res.json({
      success: true,
      data: {
        election: {
          id: election.id,
          title: election.title,
          status: election.status,
          is_finalized: election.is_finalized,
          winner_candidate_id: election.winner_candidate_id
        },
        total_votes: totalVotes,
        candidates: rows
      }
    });
  });

  // ── GET ALL WINNERS (PUBLIC) ──────────────────────────────────────────────
  const getWinners = asyncHandler(async (req, res) => {
    const { Vacancy } = models;
    const elections = await Election.findAll({
      where: { is_finalized: true },
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['position_name']
        },
        {
          model: Candidate,
          as: 'winner',
          include: [
            { model: User, as: 'user', attributes: ['full_name', 'email'] },
            { 
              model: Application, 
              as: 'application', 
              attributes: ['photo_upload'],
              include: [
                {
                  model: Vacancy,
                  as: 'vacancy',
                  attributes: ['campus']
                }
              ]
            }
          ]
        }
      ],
      order: [['finalized_at', 'DESC']]
    });

    const hostUrl = `${req.protocol}://${req.get('host')}`;

    const formatted = elections.map(el => {
      const winner = el.winner;
      let photoUrl = null;
      if (winner && winner.application && winner.application.photo_upload) {
        const rawPhoto = winner.application.photo_upload;
        if (rawPhoto.startsWith('http') || rawPhoto.startsWith('data:')) {
          photoUrl = rawPhoto;
        } else {
          const cleanPath = rawPhoto.replace(/^\/+/, '').replace(/^uploads\/+/, '');
          photoUrl = `${hostUrl}/uploads/${cleanPath}`;
        }
      }

      return {
        election_id: el.id,
        election_title: el.title,
        finalized_at: el.finalized_at,
        position_name: el.position?.position_name || 'N/A',
        campus: winner?.application?.vacancy?.campus || 'N/A',
        winner_name: winner?.user?.full_name || 'No winner declared',
        winner_email: winner?.user?.email || '',
        winner_photo: photoUrl
      };
    });

    res.json({ success: true, data: formatted });
  });

  return {
    finalizeElection,
    getFinalizedResult,
    getLiveResults,
    getWinners
  };
};