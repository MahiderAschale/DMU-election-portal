// controllers/election.controller.js
const asyncHandler = require('../utils/asyncHandler');

module.exports = (models) => {
  const { Election, Position } = models;

  const createElection = asyncHandler(async (req, res) => {
    const { title, description, position_id, start_date, end_date, status } = req.body;

    // Validation
    if (!title || !position_id || !start_date || !end_date) {
      res.status(400);
      throw new Error('title, position_id, start_date, and end_date are required');
    }

    const normalizedTitle = String(title).trim();
    if (normalizedTitle.length === 0 || normalizedTitle.length > 200) {
      res.status(400);
      throw new Error("title must be between 1 and 200 characters");
    }

    const normalizedPositionId = Number(position_id);
    if (!Number.isInteger(normalizedPositionId) || normalizedPositionId <= 0) {
      res.status(400);
      throw new Error("position_id must be a valid positive integer");
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      res.status(400);
      throw new Error("start_date and end_date must be valid dates");
    }
    if (end < start) {
      res.status(400);
      throw new Error("end_date must be the same as or after start_date");
    }

    const position = await Position.findByPk(normalizedPositionId);
    if (!position) {
      res.status(400);
      throw new Error("Selected position does not exist");
    }

    const election = await Election.create({
      title: normalizedTitle,
      description: description || null,
      position_id: normalizedPositionId,
      start_date,
      end_date,
      status: status || 'upcoming'
    });

    res.status(201).json({
      success: true,
      data: election
    });
  });

  const getElections = asyncHandler(async (req, res) => {
    const elections = await Election.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: elections });
  });

  const getElectionById = asyncHandler(async (req, res) => {
    const election = await Election.findByPk(req.params.id);
    if (!election) {
      res.status(404);
      throw new Error('Election not found');
    }
    res.json({ success: true, data: election });
  });

  const updateElection = asyncHandler(async (req, res) => {
    const { title, description, position_id, start_date, end_date, status } = req.body;

    const election = await Election.findByPk(req.params.id);
    if (!election) {
      res.status(404);
      throw new Error('Election not found');
    }

    await election.update({
      title,
      description,
      position_id,
      start_date,
      end_date,
      status
    });

    res.json({ success: true, data: election });
  });

  const deleteElection = asyncHandler(async (req, res) => {
    const election = await Election.findByPk(req.params.id);
    if (!election) {
      res.status(404);
      throw new Error('Election not found');
    }
    await election.destroy();
    res.json({ success: true, message: 'Election deleted successfully' });
  });

  return {
    createElection,
    getElections,
    getElectionById,
    updateElection,
    deleteElection
  };
};