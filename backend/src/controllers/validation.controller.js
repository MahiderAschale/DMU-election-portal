const crypto = require("crypto");
const sendEmail = require("../utils/emailService");

module.exports = (models) => {
  const { HREmployee, DeanVoterUpload, PendingVoter, VoterList, User, Election } = models;

  const normalize = (value) => (value || "").trim().toLowerCase();

  const getMatchKey = (record) =>
    `${normalize(record.full_name)}|${normalize(record.employee_id || "")}|${normalize(record.job_title || "")}`;

  const getValidationData = async (req, res) => {
    const [hr, dean, elections] = await Promise.all([
      HREmployee.findAll(),
      DeanVoterUpload.findAll({ order: [["uploaded_at", "DESC"]] }),
      Election.findAll({ order: [["start_date", "DESC"], ["id", "DESC"]] })
    ]);

    res.json({ success: true, data: { hr, dean, elections } });
  };

  const validateVoters = async (req, res) => {
    const electionId = Number(req.params.election_id || req.body.election_id);
    const where = {};

    if (electionId) {
      const election = await Election.findByPk(electionId);
      if (!election) {
        return res.status(404).json({
          success: false,
          message: "Election not found. Choose a valid election before validation."
        });
      }
      where.election_id = electionId;
    }

    const deanList = await DeanVoterUpload.findAll({ where });
    const hrList = await HREmployee.findAll();

    const hrMap = new Map();
    hrList.forEach((hr) => hrMap.set(getMatchKey(hr), hr));

    const validated = [];
    const emailed = [];
    const skipped = [];

    for (const deanVoter of deanList) {
      const matchKey = getMatchKey(deanVoter);
      const hrMatch = hrMap.get(matchKey);
      if (!hrMatch) continue;

      const voterElectionId = Number(deanVoter.election_id);
      const email = normalize(hrMatch.email || deanVoter.email);
      const fullName = hrMatch.full_name || deanVoter.full_name;
      const existingUser = await User.findOne({ where: { email } });

      if (!voterElectionId || !(await Election.findByPk(voterElectionId))) {
        skipped.push({
          email,
          election_id: deanVoter.election_id,
          reason: "Election does not exist"
        });
        continue;
      }

      const [voterListEntry, listCreated] = await VoterList.findOrCreate({
        where: {
          election_id: voterElectionId,
          email
        },
        defaults: {
          election_id: voterElectionId,
          full_name: fullName,
          email,
          user_id: existingUser?.id || null,
          approved_by: req.user?.id || null,
          added_at: new Date()
        }
      });

      if (!listCreated) {
        await voterListEntry.update({
          full_name: fullName,
          user_id: voterListEntry.user_id || existingUser?.id || null,
          approved_by: voterListEntry.approved_by || req.user?.id || null
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const [record, wasCreated] = await PendingVoter.findOrCreate({
        where: { email },
        defaults: {
          full_name: fullName,
          email,
          election_id: voterElectionId,
          activation_token: token,
          is_activated: false
        }
      });

      if (!wasCreated) {
        await record.update({
          full_name: fullName,
          election_id: voterElectionId,
          activation_token: token,
          is_activated: false
        });
      }

      const activationLink = `http://localhost:3000/activate/${record.activation_token}`;

      await sendEmail({
        to: record.email,
        subject: "Activate your voter account",
        message: `Hello ${record.full_name},\n\nClick the link below to activate your voter account:\n\n${activationLink}\n\nElection System`
      });

      validated.push(record);
      emailed.push(record.email);
    }

    res.json({
      success: true,
      message: `${validated.length} voters validated, ${emailed.length} activation emails sent, ${skipped.length} skipped`,
      data: {
        validated: validated.length,
        emailsSent: emailed.length,
        skipped
      }
    });
  };

  const activateVoter = async (req, res) => {
    const { token } = req.params;
    const voter = await PendingVoter.findOne({ where: { activation_token: token } });

    if (!voter) {
      return res.status(404).json({ success: false, message: "Invalid or expired activation link." });
    }

    if (!voter.election_id) {
      return res.status(400).json({
        success: false,
        message: "No election associated with this activation. Please contact election manager."
      });
    }

    const existingUser = await User.findOne({ where: { email: normalize(voter.email) } });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User account not found. Please register first."
      });
    }

    const [voterListEntry, created] = await VoterList.findOrCreate({
      where: {
        election_id: voter.election_id,
        email: normalize(voter.email)
      },
      defaults: {
        election_id: voter.election_id,
        full_name: voter.full_name,
        email: normalize(voter.email),
        user_id: existingUser.id,
        approved_by: null,
        added_at: new Date()
      }
    });

    if (!created) {
      await voterListEntry.update({
        full_name: voter.full_name,
        user_id: existingUser.id
      });
    }

    await VoterList.update(
      { user_id: existingUser.id },
      { where: { email: normalize(voter.email), user_id: null } }
    );

    await voter.destroy();

    res.json({
      success: true,
      message: "Your voter account has been activated successfully!"
    });
  };

  return { getValidationData, validateVoters, activateVoter };
};
