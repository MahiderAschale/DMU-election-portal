const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/emailService');
const { Op } = require('sequelize');

module.exports = (models) => {
  const { 
    VoterRequest, 
    User, 
    Election, 
    Role, 
    HREmployee, 
    DeanVoterUpload, 
    VoterList,
    ManifestoSession 
  } = models;

  // ===============================
  //  CREATE VOTER REQUEST
  // ===============================
  const createRequest = asyncHandler(async (req, res) => {
    const { election_id, receiver_role, description } = req.body;

    if (!election_id || !receiver_role) {
      res.status(400);
      throw new Error("election_id and receiver_role are required");
    }

    const role = await Role.findOne({
      where: {
        role_name: { [Op.iLike]: receiver_role }
      }
    });

    if (!role) {
      res.status(400);
      throw new Error("Invalid receiver_role");
    }

    const request = await VoterRequest.create({
      election_id,
      requested_by: req.user.id,
      receiver_role: role.id,
      description,
      status: 'pending'
    });

    const election = await Election.findByPk(election_id);
    if (!election) {
      res.status(404);
      throw new Error("Election not found");
    }

    const receivers = await User.findAll({
      where: { role_id: role.id }
    });

    for (const r of receivers) {
      await sendEmail({
        to: r.email,
        subject: "Voter Request Received",
        message: `
Hello ${r.full_name},

A new voter request has been sent.

 Election: ${election?.title}
 Description: ${description || "No description provided"}

Please login and upload the required CSV file.

Regards,
Election System
        `
      });
    }

    res.status(201).json({
      success: true,
      message: "Voter request sent + email notification sent",
      data: request
    });
  });

  // ===============================
  //  SUBMIT VOTERS (Dean)
  // ===============================
  const submitVoters = asyncHandler(async (req, res) => {
    const { election_id, voters } = req.body;

    if (!election_id) {
      res.status(400);
      throw new Error('election_id is required');
    }

    if (!Array.isArray(voters) || voters.length === 0) {
      res.status(400);
      throw new Error('voters array required');
    }

    const submitted = [];

    for (const voter of voters) {
      const record = await VoterList.create({
        election_id,
        full_name: voter.full_name.trim(),
        email: voter.email.trim().toLowerCase(),
        approved_by: null,
        added_at: new Date()
      });

      submitted.push(record);
    }

    res.json({
      success: true,
      message: "Voters submitted successfully",
      data: submitted
    });
  });

  // ===============================
  // ✔ APPROVE REQUEST + ADD TO VOTER LIST  ← FIXED
  // ===============================
  const approveVoter = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Fetch request with user details
    const request = await VoterRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requestedBy',        // Important: Make sure this association exists
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    if (request.status === 'approved') {
      res.status(400);
      throw new Error('Request is already approved');
    }

    const transaction = await models.sequelize.transaction();

    try {
      // 1. Update request status
      await request.update({
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date()
      }, { transaction });

      // 2. Add to VoterList
      const voterListRecord = await VoterList.create({
        election_id: request.election_id,
        user_id: request.requested_by,
        full_name: request.requestedBy?.full_name || null,
        email: request.requestedBy?.email?.trim().toLowerCase() || null,
        approved_by: req.user.id,
        approved_at: new Date(),
        added_at: new Date(),
        status: 'active'                    
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: "Voter request approved and successfully added to voter list",
        data: {
          request_id: request.id,
          voter_list_id: voterListRecord.id
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });

  // ===============================
  //  GET REQUESTS
  // ===============================
  const getRequests = asyncHandler(async (req, res) => {
    const requests = await VoterRequest.findAll({
      include: [
        {
          model: Election,
          as: "election",
          attributes: ["id", "title", "start_date", "end_date"]
        },
        {
          model: Role,
          as: "receiverRole",
          attributes: ["role_name"]
        }
      ],
      order: [["requested_at", "DESC"]]
    });

    const payload = requests.map((request) => {
      const item = request.toJSON();
      return {
        ...item,
        receiver_role_name: item.receiverRole?.role_name || null
      };
    });

    res.json({ success: true, data: payload });
  });

  // ===============================
  // GET VOTERS BY ELECTION
  // ===============================
  const getElectionVoters = asyncHandler(async (req, res) => {
    const { election_id } = req.params;

    const voters = await VoterList.findAll({
      where: { election_id },
      order: [["added_at", "DESC"]]
    });

    res.json({ success: true, data: voters });
  });

  // ===============================
  //  GET MY VOTER PROFILE
  // ===============================
  const getMyVoterProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const email = user.email.trim().toLowerCase();

    const hrRecord = await HREmployee.findOne({ where: { email } });
    const deanRecord = await DeanVoterUpload.findOne({ where: { email } });
    const source = hrRecord || deanRecord;

    const voterListEntries = await VoterList.findAll({
      where: {
        [Op.or]: [
          { user_id: user.id },
          { email: { [Op.iLike]: email } }
        ]
      },
      include: [
        {
          model: Election,
          as: "election",
          attributes: ["id", "title", "position_id", "start_date", "end_date", "status"]
        }
      ],
      order: [["added_at", "DESC"]]
    });

    const elections = voterListEntries.map((entry) => entry.election).filter(Boolean);
    const electionIds = elections.map((e) => e.id);

    let manifestoSessions = [];
    if (ManifestoSession && electionIds.length > 0) {
      manifestoSessions = await ManifestoSession.findAll({
        where: { election_id: electionIds },
        include: [
          {
            model: Election,
            as: "election",
            attributes: ["id", "title", "start_date", "end_date", "status"]
          }
        ],
        order: [["start_time", "ASC"]]
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: source?.phone_number || null,
        department: source?.department || null,
        faculty: source?.faculty || null,
        job_title: source?.job_title || null,
        voter_list: voterListEntries,
        elections,
        manifesto_sessions: manifestoSessions
      }
    });
  });

  return {
    createRequest,
    submitVoters,
    approveVoter,
    getRequests,
    getElectionVoters,
    getMyVoterProfile
  };
};

