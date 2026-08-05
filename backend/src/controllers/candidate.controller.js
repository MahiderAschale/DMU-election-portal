const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const sendEmail = require("../utils/emailService");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

module.exports = (models) => {
  const { Candidate, User, Role, Application, Position, Election, VotingCard, VoterList, ManifestoSession, Vacancy } = models;
  const jwtSecret = process.env.JWT_SECRET || "fallback_secret_change_in_production";

  // ===============================
  // ✅ APPROVE CANDIDATE
  // ===============================
  const approveCandidate = asyncHandler(async (req, res) => {
    const { application_id } = req.params;

    const application = await Application.findByPk(application_id);

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    // update application status
    await application.update({ status: "approved" });

    // get role
    const role = await Role.findOne({
      where: {
        role_name: {
          [Op.iLike]: "candidate"
        }
      }
    });

    if (!role) {
      throw new Error("Candidate role not found");
    }

    const existingCandidate = await Candidate.findOne({
      where: { application_id: application.id }
    });

    if (existingCandidate) {
      res.status(400);
      throw new Error("Candidate already approved for this application");
    }

    // create or update user
    let user = await User.findOne({ where: { email: application.email } });

    if (!user) {
      const tempPassword = await bcrypt.hash("Candidate@123", 10);

      user = await User.create({
        full_name: application.full_name,
        email: application.email,
        password_hash: tempPassword,
        role_id: role.id,
        status: "inactive"
      });

    } else {
      await user.update({ role_id: role.id });
    }

    const vacancy = await Vacancy.findByPk(application.vacancy_id);
    const position = await Position.findOne({
      where: {
        position_name: {
          [Op.iLike]: vacancy?.position_name || ""
        }
      }
    });
    const positionId = position?.id || application.position_id || null;
    const election = positionId
      ? await Election.findOne({
          where: { position_id: positionId },
          order: [["id", "DESC"]]
        })
      : null;

    // create candidate
    const candidate = await Candidate.create({
      application_id: application.id,
      position_id: positionId,
      approval_status: "approved",
      approved_at: new Date(),
      user_id: user.id,
      election_id: election?.id || null
    });
    // ===============================


    // =========================
    //  CREATE ACTIVATION TOKEN
    // =========================
    const token = jwt.sign(
      { user_id: user.id },
      jwtSecret,
      { expiresIn: "1d" }
    );

    const activationLink = `http://localhost:3000/activate/${token}`;

    // =========================
    //  SEND APPROVAL EMAIL
    // =========================
    await sendEmail({
      to: user.email,
      subject: "Approved - Activate Your Account",
      message: `
Hello ${user.full_name},

Congratulations! You have been APPROVED as a candidate.

Activate your account here:
${activationLink}

This link will expire in 24 hours.

Regards,
Election Committee
      `
    });

   
    res.json({
      success: true,
      message: "Candidate approved successfully",
      data: candidate
    });
  });

  // ===============================
  //  REJECT CANDIDATE
  // ===============================
  const rejectCandidate = asyncHandler(async (req, res) => {
    const { application_id } = req.params;

    const application = await Application.findByPk(application_id);

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    await application.update({ status: "rejected" });

    // =========================
    //  COMPLAINT LINK
    // =========================
    const complaintLink = `http://localhost:3000/complaint/${application.id}`;

    // =========================
    //  SEND REJECTION EMAIL
    // =========================
    await sendEmail({
      to: application.email,
      subject: " Application Rejected",
      message: `
Dear ${application.full_name},

We regret to inform you that your application has been REJECTED.

 If you believe this decision is incorrect, you can submit a complaint here:
${complaintLink}

 You have 24 hours to submit your complaint.

Regards,
Election Committee
      `
    });

    console.log("Rejection email sent to:", application.email);

    res.json({
      success: true,
      message: "Candidate rejected"
    });
  });

  // ===============================
  //  UPDATE STATUS
  // ===============================
  const updateCandidateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approval_status } = req.body;

    const candidate = await Candidate.findByPk(id);

    if (!candidate) {
      res.status(404);
      throw new Error("Candidate not found");
    }

    await candidate.update({ approval_status });

    res.json({
      success: true,
      message: "Candidate status updated"
    });
  });
  //  GET CURRENT CANDIDATE
// ===============================
const getMyCandidate = asyncHandler(async (req, res) => {
  const user_id = req.user.id;

  let candidate = await Candidate.findOne({
    where: { user_id },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["full_name", "email"]
      },
      {
        model: Position,
        as: "position",
        attributes: ["position_name"]
      },
      {
        model: Election,
        as: "election",
        attributes: ["id", "title", "position_id", "start_date", "end_date", "status"]
      },
      {
        model: Application,
        as: "application",
        attributes: ["id", "vacancy_id"]
      }
    ]
  });

  if (!candidate) {
    res.status(404);
    throw new Error("Candidate not found");
  }

  let election = candidate.election;
  let positionId = candidate.position_id;

  if (!positionId && candidate.application?.vacancy_id) {
    const vacancy = await Vacancy.findByPk(candidate.application.vacancy_id);
    const position = await Position.findOne({
      where: {
        position_name: {
          [Op.iLike]: vacancy?.position_name || ""
        }
      }
    });

    positionId = position?.id || null;

    if (positionId) {
      await candidate.update({ position_id: positionId });
    }
  }

  if (!election && positionId) {
    election = await Election.findOne({
      where: { position_id: positionId },
      order: [["id", "DESC"]]
    });

    if (election) {
      await candidate.update({ election_id: election.id, position_id: positionId });
      candidate = await Candidate.findByPk(candidate.id, {
        include: [
          { model: User, as: "user", attributes: ["full_name", "email"] },
          { model: Position, as: "position", attributes: ["position_name"] },
          { model: Election, as: "election", attributes: ["id", "title", "position_id", "start_date", "end_date", "status"] },
          { model: Application, as: "application", attributes: ["id", "vacancy_id"] }
        ]
      });
    }
  }

  const session = election
    ? await ManifestoSession.findOne({ where: { election_id: election.id } })
    : null;

  const payload = candidate.toJSON();
  payload.election_id = payload.election_id || election?.id || null;
  payload.election = payload.election || (election ? election.toJSON() : null);
  payload.manifesto_meeting_link = session?.meeting_link || payload.manifesto_meeting_link || null;
  payload.manifesto_scheduled_at = session?.start_time || payload.manifesto_scheduled_at || null;
  payload.manifesto_end_time = session?.end_time || null;

  res.json({
    success: true,
    data: payload
  });
});

const getVoterSelectedCandidates = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const voterEntries = await VoterList.findAll({
    where: {
      [Op.or]: [
        { user_id: user.id },
        { email: { [Op.iLike]: user.email.trim().toLowerCase() } }
      ]
    },
    attributes: ["election_id"]
  });

  const electionIds = [...new Set(voterEntries.map((entry) => entry.election_id).filter(Boolean))];

  if (electionIds.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const where = { election_id: electionIds };

  const cards = await VotingCard.findAll({
    where,
    include: [
      {
        model: Candidate,
        as: "candidate",
        where: { approval_status: "approved" },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["full_name", "email"]
          },
          {
            model: Position,
            as: "position",
            attributes: ["position_name"]
          },
          {
            model: Application,
            as: "application",
            attributes: ["photo_upload"]
          }
        ]
      },
      {
        model: Election,
        as: "election",
        attributes: ["id", "title", "status", "start_date", "end_date"]
      }
    ],
    order: [["created_at", "DESC"]]
  });

  const hostUrl = `${req.protocol}://${req.get("host")}`;
  const payload = cards.map((card) => {
    const plainCard = card.toJSON();
    const rawPhoto = plainCard?.candidate?.application?.photo_upload;

    let photoUploadUrl = null;
    if (rawPhoto) {
      if (rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://") || rawPhoto.startsWith("data:")) {
        photoUploadUrl = rawPhoto;
      } else {
        const cleanPath = rawPhoto.replace(/^\/+/, "").replace(/^uploads\/+/, "");
        photoUploadUrl = `${hostUrl}/uploads/${cleanPath}`;
      }
    }

    return {
      ...plainCard,
      candidate: {
        ...plainCard.candidate,
        application: {
          ...plainCard.candidate?.application,
          photo_upload_url: photoUploadUrl
        }
      }
    };
  });

  res.json({
    success: true,
    data: payload
  });
});

  return {
    approveCandidate,
    rejectCandidate,
    getMyCandidate,
    getVoterSelectedCandidates,
    updateCandidateStatus
  };
};
