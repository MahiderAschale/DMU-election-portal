const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApplicationDocument = sequelize.define('ApplicationDocument', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    application_id: { type: DataTypes.INTEGER, allowNull: false },

    //  ALL FILES BASE64
    educational_level: DataTypes.TEXT,
    work_experience: DataTypes.TEXT,
    leadership: DataTypes.TEXT,
    work_efficiency: DataTypes.TEXT,

    

  }, {
    tableName: 'application_documents',
    timestamps: false,
    underscored: true
  });

  return ApplicationDocument;
};