// models/VoterRequest.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VoterRequest = sequelize.define('VoterRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    election_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // RENAMED COLUMN
    receiver_role: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending'
    },
    requested_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'voter_requests',
    timestamps: false,
    underscored: true
  });

  return VoterRequest;
};