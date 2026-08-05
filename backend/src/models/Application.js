
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    vacancy_id: { type: DataTypes.INTEGER, allowNull: false },

    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },

    gender: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    disability: DataTypes.TEXT,

   
    photo_upload: DataTypes.TEXT,

    
  
    strategic_plan_file: DataTypes.TEXT,
    

 
    educational_document: DataTypes.TEXT,

    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },

    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }

  }, {
    tableName: 'applications',
    timestamps: false,
    underscored: true
  });

  return Application;
};