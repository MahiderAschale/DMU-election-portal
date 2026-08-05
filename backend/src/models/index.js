// models/index.js
require("dotenv").config();

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

// Import Models
const RoleModel = require("./Role");
const UserModel = require("./User");
const PositionModel = require("./position");
const VacancyModel = require("./Vacancy");
const ApplicationModel = require("./Application");
const ApplicationDocumentModel = require("./ApplicationDocument");
const ScreeningResultModel = require("./ScreeningResult");
const ElectionModel = require("./Election");
const CandidateModel = require("./Candidate");
const VoterRequestModel = require("./VoterRequest");
const VoterListModel = require("./VoterList");
const ManifestoSessionModel = require("./ManifestoSession");
const ManifestoAttendanceModel = require("./ManifestoAttendance");
const VoteModel = require("./Vote");
const ComplaintModel = require("./Complaint");
const DeanVoterUploadModel = require("./DeanVoterUpload");
const HREmployeeModel = require("./HREmployee");
const PendingVoterModel = require("./pendingVoter");
const { DataTypes } = require("sequelize");
const VotingCardModel = require("./VotingCard");

// Initialize Models
const Role = RoleModel(sequelize);
const User = UserModel(sequelize);
const Position = PositionModel(sequelize);
const Vacancy = VacancyModel(sequelize);
const Application = ApplicationModel(sequelize);
const ApplicationDocument = ApplicationDocumentModel(sequelize);
const ScreeningResult = ScreeningResultModel(sequelize);
const Election = ElectionModel(sequelize);
const Candidate = CandidateModel(sequelize);
const VoterRequest = VoterRequestModel(sequelize);
const VoterList = VoterListModel(sequelize);
const ManifestoSession = ManifestoSessionModel(sequelize);
const ManifestoAttendance = ManifestoAttendanceModel(sequelize);
const Vote = VoteModel(sequelize);
const Complaint = ComplaintModel(sequelize, DataTypes);
const DeanVoterUpload = DeanVoterUploadModel(sequelize);
const HREmployee = HREmployeeModel(sequelize);
const PendingVoter = PendingVoterModel(sequelize, DataTypes);


const VotingCard = VotingCardModel(sequelize, require("sequelize").DataTypes);

// Associations
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

Position.hasMany(Vacancy, { foreignKey: "position_id", as: "vacancies" });
Vacancy.belongsTo(Position, { foreignKey: "position_id", as: "position" });

Vacancy.hasMany(Application, { foreignKey: "vacancy_id", as: "applications" });
Application.belongsTo(Vacancy, { foreignKey: "vacancy_id", as: "vacancy" });

Application.hasOne(ApplicationDocument, { foreignKey: "application_id", as: "documents" });
ApplicationDocument.belongsTo(Application, { foreignKey: "application_id", as: "application" });
Application.hasOne(ScreeningResult, { foreignKey: "application_id", as: "screening_result" });
ScreeningResult.belongsTo(Application, { foreignKey: "application_id", as: "application" });

Position.hasMany(Election, { foreignKey: "position_id", as: "elections" });
Election.belongsTo(Position, { foreignKey: "position_id", as: "position" });

Election.belongsTo(Candidate, { foreignKey: "winner_candidate_id", as: "winner" });

Election.hasMany(Candidate, { foreignKey: "election_id", as: "candidates" });
Candidate.belongsTo(Election, { foreignKey: "election_id", as: "election" });

Position.hasMany(Candidate, { foreignKey: "position_id", as: "candidates" });
Candidate.belongsTo(Position, { foreignKey: "position_id", as: "position" });

User.hasOne(Candidate, { foreignKey: "user_id", as: "candidate" });
Candidate.belongsTo(User, { foreignKey: "user_id", as: "user" });

Application.hasOne(Candidate, { foreignKey: "application_id", as: "candidate" });
Candidate.belongsTo(Application, { foreignKey: "application_id", as: "application" });
Election.hasMany(VoterRequest, { foreignKey: "election_id", as: "voterRequests" });
VoterRequest.belongsTo(Election, { foreignKey: "election_id", as: "election" });

Role.hasMany(VoterRequest, { foreignKey: "receiver_role", as: "receiverVoterRequests" });
VoterRequest.belongsTo(Role, { foreignKey: "receiver_role", as: "receiverRole" });

User.hasMany(VoterRequest, { foreignKey: "requested_by", as: "requestedVoterRequests" });
VoterRequest.belongsTo(User, { foreignKey: "requested_by", as: "requester" });

Election.hasMany(VoterList, { foreignKey: "election_id", as: "voterLists" });
VoterList.belongsTo(Election, { foreignKey: "election_id", as: "election" });

User.hasMany(VoterList, { foreignKey: "approved_by", as: "approvedVoterLists" });
VoterList.belongsTo(User, { foreignKey: "approved_by", as: "approver" });

Election.hasMany(ManifestoSession, { foreignKey: "election_id", as: "manifestoSessions" });
ManifestoSession.belongsTo(Election, { foreignKey: "election_id", as: "election" });

User.hasMany(ManifestoAttendance, { foreignKey: "user_id", as: "manifestoAttendances" });
ManifestoAttendance.belongsTo(User, { foreignKey: "user_id", as: "user" });

Election.hasMany(ManifestoAttendance, { foreignKey: "election_id", as: "manifestoAttendances" });
ManifestoAttendance.belongsTo(Election, { foreignKey: "election_id", as: "election" });

User.hasMany(Vote, { foreignKey: "voter_id", as: "votes" });
Vote.belongsTo(User, { foreignKey: "voter_id", as: "voter" });

Election.hasMany(Vote, { foreignKey: "election_id", as: "votes" });
Vote.belongsTo(Election, { foreignKey: "election_id", as: "election" });

Candidate.hasMany(Vote, { foreignKey: "candidate_id", as: "votes" });
Vote.belongsTo(Candidate, { foreignKey: "candidate_id", as: "candidate" });

Election.hasMany(VotingCard, { foreignKey: "election_id", as: "votingCards" });
VotingCard.belongsTo(Election, { foreignKey: "election_id", as: "election" });

Candidate.hasMany(VotingCard, { foreignKey: "candidate_id", as: "votingCards" });
VotingCard.belongsTo(Candidate, { foreignKey: "candidate_id", as: "candidate" });

User.hasMany(VotingCard, { foreignKey: "user_id", as: "votingCards" });
VotingCard.belongsTo(User, { foreignKey: "user_id", as: "user" });

Complaint.belongsTo(Application, {
  foreignKey: "application_id",
  as: "application"
});

Application.hasMany(Complaint, {
  foreignKey: "application_id",
  as: "complaints"
});
// Export all
module.exports = {
  sequelize,
  Role,
  User,
  Position,
  Vacancy,
  Application,
  ApplicationDocument,
  ScreeningResult,
  Election,
  Candidate,
  VoterRequest,
  VoterList,
  ManifestoSession,
  ManifestoAttendance,
  Vote,
  Complaint,
  VotingCard,
  HREmployee,
  DeanVoterUpload,
  PendingVoter
};
