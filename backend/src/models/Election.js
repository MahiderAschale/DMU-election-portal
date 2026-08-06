// models/Election.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Election = sequelize.define('Election', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'upcoming'
    },
    is_finalized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    winner_candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    finalized_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'elections',
    timestamps: true,
    underscored: true
  });

  return Election;
};