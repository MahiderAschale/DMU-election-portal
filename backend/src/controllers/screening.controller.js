const asyncHandler = require("../utils/asyncHandler");

module.exports = (models) => {
  const { Application, Vacancy, ScreeningResult } = models;

  const parseRequiredScore = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseOptionalScore = (value) => {
    if (value === "" || value === null || typeof value === "undefined") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const upsertScreeningResult = asyncHandler(async (req, res) => {
    const applicationId = Number(req.params.applicationId);
    if (!applicationId || Number.isNaN(applicationId)) {
      return res.status(400).json({ success: false, message: "Invalid application id" });
    }

    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Check at least 3 candidates must apply in order to pass to screening process
    const appCount = await Application.count({
      where: { vacancy_id: application.vacancy_id }
    });
    if (appCount < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 candidates must apply for this vacancy in order to pass to the screening process."
      });
    }

    const educationalLevelScore = parseRequiredScore(req.body.educational_level);
    const workExperienceScore = parseRequiredScore(req.body.work_experience);
    const leadershipScore = parseRequiredScore(req.body.leadership);
    const workEfficiencyScore = parseRequiredScore(req.body.work_efficiency);

    if (
      educationalLevelScore === null ||
      workExperienceScore === null ||
      leadershipScore === null ||
      workEfficiencyScore === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Educational level, work experience, leadership and work efficiency scores are required numbers"
      });
    }

    const genderScore = parseOptionalScore(req.body.gender);
    const disabilityScore = parseOptionalScore(req.body.disability);

    if (
      (req.body.gender !== "" &&
        req.body.gender !== null &&
        typeof req.body.gender !== "undefined" &&
        genderScore === null) ||
      (req.body.disability !== "" &&
        req.body.disability !== null &&
        typeof req.body.disability !== "undefined" &&
        disabilityScore === null)
    ) {
      return res.status(400).json({
        success: false,
        message: "Optional gender/disability scores must be numbers when provided"
      });
    }

    const totalScore =
      educationalLevelScore +
      workExperienceScore +
      leadershipScore +
      workEfficiencyScore +
      (genderScore || 0) +
      (disabilityScore || 0);

    const payload = {
      application_id: applicationId,
      educational_level: educationalLevelScore,
      work_experience: workExperienceScore,
      leadership: leadershipScore,
      work_efficiency: workEfficiencyScore,
      gender: genderScore,
      disability: disabilityScore,
      // total: totalScore
    };

    const existing = await ScreeningResult.findOne({ where: { application_id: applicationId } });
    const screeningResult = existing ? await existing.update(payload) : await ScreeningResult.create(payload);

    return res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? "Screening result updated" : "Screening result saved",
      data: screeningResult
    });
  });

  const getScreeningResults = asyncHandler(async (req, res) => {
    const results = await ScreeningResult.findAll({
      include: [
        {
          model: Application,
          as: "application",
          include: [{ model: Vacancy, as: "vacancy", attributes: ["position_name", "campus"] }]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({ success: true, data: results });
  });

  const getScreeningResultByApplicationId = asyncHandler(async (req, res) => {
    const applicationId = Number(req.params.applicationId);
    const result = await ScreeningResult.findOne({ where: { application_id: applicationId } });

    if (!result) {
      return res.status(404).json({ success: false, message: "Screening result not found" });
    }

    res.json({ success: true, data: result });
  });

  return {
    upsertScreeningResult,
    getScreeningResults,
    getScreeningResultByApplicationId
  };
};
