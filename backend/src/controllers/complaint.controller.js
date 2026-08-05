const asyncHandler = require("../utils/asyncHandler");
const sendEmail = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (models) => {
  const { Complaint, Application, User, Role } = models;
  const jwtSecret = process.env.JWT_SECRET || "fallback_secret_change_in_production";

  // ===============================
  //  SUBMIT COMPLAINT
  // ===============================
  const submitComplaint = asyncHandler(async (req, res) => {
    const { application_id, message } = req.body;

    const application = await Application.findByPk(application_id);

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    const complaint = await Complaint.create({
      application_id,
      message
    });

    res.json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint
    });
  });

  // ===============================
  //  GET COMPLAINTS
  // ===============================
  const getComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.findAll({
      include: [
        {
          model: Application,
          as: "application",
          attributes: ["id", "full_name", "email"]
        }
      ]
    });

    res.json({ success: true, data: complaints });
  });

  // ===============================
  // ✔ APPROVE COMPLAINT
  // ===============================
  const approveComplaint = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id);

    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found");
    }

    const application = await Application.findByPk(complaint.application_id);

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    //  update complaint
    await complaint.update({
      status: "approved",
      review_reason: "Complaint accepted by manager",
      reviewed_at: new Date()
    });

    // ===============================
    //  CREATE / UPDATE USER
    // ===============================
    const role = await Role.findOne({ where: { role_name: "Candidate" } });

    let user = await User.findOne({ where: { email: application.email } });

    if (!user) {
      const tempPassword = await bcrypt.hash("Temp@123", 10);

      user = await User.create({
        full_name: application.full_name,
        email: application.email,
        password_hash: tempPassword,
        role_id: role.id,
        is_active: false //IMPORTANT (must activate via email)
      });
    } else {
      await user.update({
        role_id: role.id,
        is_active: false //  force re-activation
      });
    }

    // ===============================
    // GENERATE TOKEN (CORRECT WAY)
    // ===============================
    const token = jwt.sign(
      { user_id: user.id }, //  MUST be user.id
      jwtSecret,
      { expiresIn: "1d" }
    );

    const activationLink = `http://localhost:3000/activate/${token}`;

    // ===============================
    //  SEND EMAIL (APPROVED)
    // ===============================
    await sendEmail({
      to: user.email,
      subject: "Complaint Approved - Activate Your Account",
      message: `
Hello ${user.full_name},

Your complaint has been APPROVED.

You can now activate your account and continue as a candidate.

 Activate your account:
${activationLink}

This link expires in 24 hours.

Regards,
Election Committee
      `
    });

    res.json({
      success: true,
      message: "Complaint approved and activation email sent"
    });
  });

  // ===============================
  //  REJECT COMPLAINT
  // ===============================
  const rejectComplaint = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await Complaint.findByPk(id);

    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found");
    }

    const application = await Application.findByPk(complaint.application_id);

    await complaint.update({
      status: "rejected",
      review_reason: reason || "No reason provided",
      reviewed_at: new Date()
    });

    // ===============================
    //  SEND EMAIL (REJECTED)
    // ===============================
    await sendEmail({
      to: application.email,
      subject: "Complaint Rejected",
      message: `
Hello ${application.full_name},

We regret to inform you that your complaint has been REJECTED.

Reason:
${reason || "No reason provided"}

Regards,
Election Committee
      `
    });

    res.json({
      success: true,
      message: "Complaint rejected and email sent"
    });
  });

  return {
    submitComplaint,
    getComplaints,
    approveComplaint,
    rejectComplaint
  };
};
