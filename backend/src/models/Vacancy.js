const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vacancy = sequelize.define('Vacancy', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'positions',
        key: 'id'
      }
    },
    position_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    campus: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    educational_level: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specific_requirement: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'open'
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'vacancies',
    timestamps: false,
    underscored: true
  });

  return Vacancy;
};