const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeanVoterUpload = sequelize.define("DeanVoterUpload", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
      type: DataTypes.STRING
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING
    },
    department: {
      type: DataTypes.STRING
    },
    faculty: {
      type: DataTypes.STRING
    },
    job_title: {
      type: DataTypes.STRING
    },
    election_id: {                    // ← Added
      type: DataTypes.INTEGER,
      allowNull: false
    },
    uploaded_by: {
      type: DataTypes.INTEGER
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "dean_voter_uploads",
    timestamps: false,
    underscored: true
  });

  return DeanVoterUpload;
};