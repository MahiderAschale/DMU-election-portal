const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ManifestoAttendance = sequelize.define('ManifestoAttendance', {
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
      allowNull: false
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    left_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'manifesto_attendance',
    timestamps: false,
    underscored: true
  });

  return ManifestoAttendance;
};
