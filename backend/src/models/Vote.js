// models/Vote.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define('Vote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    voter_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    election_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'votes',
    timestamps: false,
    underscored: true
  });

  return Vote;
};