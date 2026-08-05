// controllers/position.controller.js
const asyncHandler = require('../utils/asyncHandler');

module.exports = (models) => {
  const { Position } = models;

  // Create Position
  const createPosition = asyncHandler(async (req, res) => {
    const { 
      election_id, 
      position_name, 
      description,
      currently_assigned_person,
      assigned_date,
      tenure_years,
      expiry_date
    } = req.body;

    const position = await Position.create({
      election_id: election_id || null,
      position_name,
      description,
      currently_assigned_person,
      assigned_date,
      tenure_years,
      expiry_date
    });

    res.status(201).json({ success: true, data: position });
  });

  // Get All Positions
  const getPositions = asyncHandler(async (req, res) => {
    const { Election, Candidate, User } = models;
    const positions = await Position.findAll({
      include: [
        {
          model: Election,
          as: 'elections',
          where: { is_finalized: true },
          required: false,
          limit: 1,
          order: [['finalized_at', 'DESC']],
          include: [
            {
              model: Candidate,
              as: 'winner',
              include: [{ model: User, as: 'user', attributes: ['full_name'] }]
            }
          ]
        }
      ],
      order: [['position_name', 'ASC']]
    });
    res.json({ success: true, data: positions });
  });

  // Get Position by ID
  const getPositionById = asyncHandler(async (req, res) => {
    const position = await Position.findByPk(req.params.id);
    if (!position) {
      res.status(404);
      throw new Error('Position not found');
    }
    res.json({ success: true, data: position });
  });

  // Update Position
  const updatePosition = asyncHandler(async (req, res) => {
    const { 
      election_id, 
      position_name, 
      description,
      currently_assigned_person,
      assigned_date,
      tenure_years,
      expiry_date
    } = req.body;

    const position = await Position.findByPk(req.params.id);
    if (!position) {
      res.status(404);
      throw new Error('Position not found');
    }

    await position.update({
      election_id: election_id !== undefined ? election_id : position.election_id,
      position_name: position_name || position.position_name,
      description: description !== undefined ? description : position.description,
      currently_assigned_person: currently_assigned_person !== undefined ? currently_assigned_person : position.currently_assigned_person,
      assigned_date: assigned_date !== undefined ? assigned_date : position.assigned_date,
      tenure_years: tenure_years !== undefined ? tenure_years : position.tenure_years,
      expiry_date: expiry_date !== undefined ? expiry_date : position.expiry_date
    });

    res.json({ success: true, data: position });
  });

  // Delete Position
  const deletePosition = asyncHandler(async (req, res) => {
    const position = await Position.findByPk(req.params.id);
    if (!position) {
      res.status(404);
      throw new Error('Position not found');
    }

    await position.destroy();
    res.json({ success: true, message: 'Position deleted successfully' });
  });

  return {
    createPosition,
    getPositions,
    getPositionById,
    updatePosition,
    deletePosition
  };
};