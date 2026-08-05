const asyncHandler = require('../utils/asyncHandler');

module.exports = (models) => {
  const { Application, ApplicationDocument, Vacancy, ScreeningResult } = models;

  // ======================
  // CREATE APPLICATION
  // ======================
  const createApplication = asyncHandler(async (req, res) => {

    const {
      vacancy_id,
      full_name,
      email,
      gender,
      phone_number,
      disability,
      photo_upload,
      strategic_plan_file,
      educational_document,
      work_efficiency_file,
      educational_level,
      work_experience,
      leadership
    } = req.body;

    const vacId = Number(vacancy_id);

    if (!vacId || isNaN(vacId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vacancy_id"
      });
    }

    const existing = await Application.findOne({
      where: { vacancy_id: vacId, email }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Already applied"
      });
    }

    // ======================
    // SAVE APPLICATION
    // ======================
    const application = await Application.create({
      vacancy_id: vacId,
      full_name,
      email,
      gender,
      phone_number,
      disability: disability || null,

      photo_upload,
      strategic_plan_file,
      educational_document,

      status: 'pending'
    });

    // ======================
    // SAVE EXTRA DOC
    // ======================
    await ApplicationDocument.create({
      application_id: application.id,
      educational_level: educational_level || null,
      work_experience: work_experience || null,
      leadership: leadership || null,
      work_efficiency: work_efficiency_file || null
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully"
    });
  });

  // ======================
  // GET APPLICATIONS
  // ======================
  const getApplications = asyncHandler(async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const toViewableUrl = (value) => {
      if (!value) return null;
      if (typeof value === "string" && value.startsWith("data:")) return value;
      return `${baseUrl}/uploads/${encodeURIComponent(value)}`;
    };

    let applications = [];
    try {
      applications = await Application.findAll({
        include: [
          {
            model: Vacancy,
            as: 'vacancy',
            attributes: ['position_name', 'campus']
          },
          {
            model: ApplicationDocument,
            as: 'documents'
          },
          {
            model: ScreeningResult,
            as: "screening_result"
          }
        ],
        order: [['applied_at', 'DESC']]
      });
    } catch (error) {
      // Fallback: allow app list to load even if screening_results table is not ready.
      applications = await Application.findAll({
        include: [
          {
            model: Vacancy,
            as: 'vacancy',
            attributes: ['position_name', 'campus']
          },
          {
            model: ApplicationDocument,
            as: 'documents'
          }
        ],
        order: [['applied_at', 'DESC']]
      });
    }

    // Count applications per vacancy
    const vacancyAppCounts = {};
    for (const app of applications) {
      const vId = app.vacancy_id;
      vacancyAppCounts[vId] = (vacancyAppCounts[vId] || 0) + 1;
    }

    const formatted = applications
      .filter(app => (vacancyAppCounts[app.vacancy_id] || 0) >= 3)
      .map(app => {
        const data = app.toJSON();
        const appCount = vacancyAppCounts[app.vacancy_id] || 0;

        return {
          ...data,
          applicant_count: appCount,
          photo_url: toViewableUrl(data.photo_upload),
          strategic_plan_url: toViewableUrl(data.strategic_plan_file),
          educational_document_url: toViewableUrl(data.educational_document),
          work_efficiency_url: toViewableUrl(data.documents?.work_efficiency)
        };
      });

    res.json({ success: true, data: formatted });
  });

  // ======================
  // GET BY ID
  // ======================
  const getApplicationById = asyncHandler(async (req, res) => {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Vacancy, as: 'vacancy' },
        { model: ApplicationDocument, as: 'documents' }
      ]
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    res.json({ success: true, data: application });
  });

  // ======================
  // UPDATE STATUS
  // ======================
  const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status) {
      res.status(400);
      throw new Error('Status is required');
    }

    const application = await Application.findByPk(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    await application.update({ status });

    res.json({
      success: true,
      message: `Application status updated to "${status}"`,
      data: application
    });
  });

  return {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplicationStatus
  };
};
