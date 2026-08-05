// models/Candidate.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Candidate = sequelize.define('Candidate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    election_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approval_status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      allowNull: false
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    manifesto_meeting_link: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    manifesto_scheduled_at: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
     
  }, {
    tableName: 'candidates',
    timestamps: false,
    underscored: true
  });

  return Candidate;
};