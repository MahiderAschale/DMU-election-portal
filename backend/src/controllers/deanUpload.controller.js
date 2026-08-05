const asyncHandler = require("../utils/asyncHandler");

module.exports = (models) => {
  const { DeanVoterUpload } = models;

  if (!DeanVoterUpload) {
    throw new Error("DeanVoterUpload model is not registered. Check models/index.js exports.");
  }

  // ===============================
  // UPLOAD DEAN CSV DATA
  // ===============================
  const uploadDeanVoters = asyncHandler(async (req, res) => {
    const { voters, election_id } = req.body;

    if (!election_id) {
      res.status(400);
      throw new Error("election_id is required");
    }

    if (!Array.isArray(voters) || voters.length === 0) {
      res.status(400);
      throw new Error("Voters array is required");
    }

    const inserted = [];

    for (const v of voters) {
      if (!v.full_name || !v.email) {
        res.status(400);
        throw new Error("full_name and email are required");
      }

      const record = await DeanVoterUpload.create({
        employee_id: v.employee_id || null,
        full_name: v.full_name.trim(),
        email: v.email.trim().toLowerCase(),
        phone_number: v.phone_number || null,
        department: v.department || null,
        faculty: v.faculty || null,
        job_title: v.job_title || null,
        election_id,                    // ← Now required
        uploaded_by: req.user.id
      });

      inserted.push(record);
    }

    res.json({
      success: true,
      message: "Dean voter list uploaded successfully",
      data: inserted
    });
  });

  // ===============================
  //  GET ALL DEAN UPLOADS
  // ===============================
  const getDeanUploads = asyncHandler(async (req, res) => {
    const data = await DeanVoterUpload.findAll({
      order: [["uploaded_at", "DESC"]]
    });

    res.json({
      success: true,
      data
    });
  });

  return {
    uploadDeanVoters,
    getDeanUploads
  };
};