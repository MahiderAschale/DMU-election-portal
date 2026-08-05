// controllers/admin.controller.js
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

module.exports = (models) => {
  const { User, Role, Election, Vote } = models;

  // ── GET SYSTEM REPORTS ──────────────────────────────────────────────────
  const getSystemReports = asyncHandler(async (req, res) => {
    const totalElections = await Election.count();
    const totalVotes = await Vote.count();
    const totalUsers = await User.count();
    
    // Total voters (users with role_id for 'Voter', which is 3)
    const totalVoters = await User.count({ where: { role_id: 3 } });
    
    // Voter participation calculation
    // Participation = (Users who have voted / Total Voters) * 100
    // But since one user can vote in multiple elections, we might want unique voters who voted.
    const uniqueVotersCount = await Vote.count({
      distinct: true,
      col: 'voter_id'
    });

    const voterParticipation = totalVoters > 0 
      ? ((uniqueVotersCount / totalVoters) * 100).toFixed(2) 
      : 0;

    res.json({
      success: true,
      data: {
        total_elections: totalElections,
        total_votes: totalVotes,
        total_users: totalUsers,
        total_voters: totalVoters,
        unique_voters_voted: uniqueVotersCount,
        voter_participation: parseFloat(voterParticipation)
      }
    });
  });

  // ── GET ELECTION MANAGERS ───────────────────────────────────────────────
  const getElectionManagers = asyncHandler(async (req, res) => {
    const managers = await User.findAll({
      where: { role_id: 2 }, // role_id 2 is election_manager
      attributes: ['id', 'full_name', 'email', 'status', 'college_id'],
      order: [['full_name', 'ASC']]
    });

    res.json({ success: true, data: managers });
  });

  // ── CREATE ELECTION MANAGER ─────────────────────────────────────────────
  const createElectionManager = asyncHandler(async (req, res) => {
    const { full_name, email, password, college_id, phone_number } = req.body;

    if (!full_name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    // Password complexity check (Backend)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400);
      throw new Error('Password must be 8+ chars, 1 uppercase, 1 special char.');
    }

    // Phone number validation (must be 9 digits after code)
    // The frontend sends it combined or separate, but here we just check length if provided
    if (phone_number && !/^\+\d+\d{9}$/.test(phone_number)) {
       // Expecting format like +251912345678 (where 912345678 is 9 digits)
       // This is a loose check, let's just ensure at least 9 digits at the end
       if (!/\d{9}$/.test(phone_number)) {
         res.status(400);
         throw new Error('Phone number must have exactly 9 digits after the country code.');
       }
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role_id: 2, // election_manager
      college_id: college_id || null,
      status: 'active',
      phone_number: phone_number || null
    });

    res.status(201).json({
      success: true,
      message: 'Election manager created successfully',
      data: {
        id: manager.id,
        full_name: manager.full_name,
        email: manager.email
      }
    });
  });

  // ── TOGGLE MANAGER STATUS ───────────────────────────────────────────────
  const toggleManagerStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Use active or inactive.');
    }

    const manager = await User.findOne({ where: { id, role_id: 2 } });
    if (!manager) {
      res.status(404);
      throw new Error('Election manager not found');
    }

    await manager.update({ status });

    res.json({
      success: true,
      message: `Manager status updated to ${status}`,
      data: manager
    });
  });

  return {
    getSystemReports,
    getElectionManagers,
    createElectionManager,
    toggleManagerStatus
  };
};
