// controllers/vacancy.controller.js
const asyncHandler = require('../utils/asyncHandler');

module.exports = (models) => {
  const { Vacancy, Application } = models;   // ← Application is now imported

  // Create Vacancy
  const createVacancy = asyncHandler(async (req, res) => {
    const { position_id, position_name, campus, educational_level, specific_requirement, description, duration_days } = req.body;

    let parsedDuration = parseInt(duration_days);
    if (isNaN(parsedDuration) || parsedDuration < 1 || parsedDuration > 7) {
      parsedDuration = 7;
    }

    const vacancy = await Vacancy.create({
      position_id: position_id || null,
      position_name,
      campus,
      educational_level,
      specific_requirement,
      description,
      status: 'open',
      duration_days: parsedDuration,
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      data: vacancy
    });
  });

  // Get All Vacancies (with optional status filter)
  const getVacancies = asyncHandler(async (req, res) => {
    // ── AUTO CLOSE EXPIRED OPEN VACANCIES ──
    const now = new Date();
    const openVacancies = await Vacancy.findAll({ where: { status: 'open' } });
    for (const vac of openVacancies) {
      const createdAt = new Date(vac.created_at || (vac.id * 1000));
      const durationDays = vac.duration_days || 7;
      const durationMs = durationDays * 24 * 60 * 60 * 1000;
      if (now.getTime() - createdAt.getTime() > durationMs) {
        await vac.update({ status: 'closed' });
      }
    }

    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const vacancies = await Vacancy.findAll({
      where,
      order: [['id', 'DESC']]
    });
    res.json({ success: true, data: vacancies });
  });

  // Get Vacancy by ID
  const getVacancyById = asyncHandler(async (req, res) => {
    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      res.status(404);
      throw new Error('Vacancy not found');
    }
    res.json({ success: true, data: vacancy });
  });

  // Update Vacancy
  const updateVacancy = asyncHandler(async (req, res) => {
    const { position_id, position_name, campus, educational_level, specific_requirement, description, status, duration_days } = req.body;

    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      res.status(404);
      throw new Error('Vacancy not found');
    }

    const updateData = {
      position_id: position_id || vacancy.position_id,
      position_name: position_name || vacancy.position_name,
      campus: campus || vacancy.campus,
      educational_level: educational_level || vacancy.educational_level,
      specific_requirement: specific_requirement || vacancy.specific_requirement,
      description: description || vacancy.description,
      status: status || vacancy.status
    };

    if (duration_days !== undefined) {
      let parsedDuration = parseInt(duration_days);
      if (!isNaN(parsedDuration) && parsedDuration >= 1 && parsedDuration <= 7) {
        updateData.duration_days = parsedDuration;
      }
    }

    // If re-opening a closed vacancy, reset its creation time so it gets a fresh 1-7 days duration
    if (status === 'open' && vacancy.status === 'closed') {
      updateData.created_at = new Date();
    }

    await vacancy.update(updateData);

    res.json({ success: true, data: vacancy });
  });

  // Delete Vacancy with proper check
  const deleteVacancy = asyncHandler(async (req, res) => {
    const vacancy = await Vacancy.findByPk(req.params.id);
    if (!vacancy) {
      res.status(404);
      throw new Error('Vacancy not found');
    }

    // Check if any applications are linked
    const applicationCount = await Application.count({
      where: { vacancy_id: req.params.id }
    });

    if (applicationCount > 0) {
      res.status(400);
      throw new Error(`Cannot delete this vacancy. It has ${applicationCount} application(s) linked to it.`);
    }

    await vacancy.destroy();

    res.json({
      success: true,
      message: "Vacancy deleted successfully"
    });
  });

  return {
    createVacancy,
    getVacancies,
    getVacancyById,
    updateVacancy,
    deleteVacancy
  };
};