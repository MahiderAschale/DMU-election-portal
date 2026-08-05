const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ScreeningResult = sequelize.define(
    "ScreeningResult",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      application_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      educational_level: { type: DataTypes.FLOAT, allowNull: false },
      work_experience: { type: DataTypes.FLOAT, allowNull: false },
      leadership: { type: DataTypes.FLOAT, allowNull: false },
      work_efficiency: { type: DataTypes.FLOAT, allowNull: false },
      gender: { type: DataTypes.FLOAT, allowNull: true },
      disability: { type: DataTypes.FLOAT, allowNull: true },
    
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    },
    {
      tableName: "screening_results",
      timestamps: false,
      underscored: true
    }
  );

  return ScreeningResult;
};
