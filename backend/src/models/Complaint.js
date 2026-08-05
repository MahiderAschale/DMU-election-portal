module.exports = (sequelize, DataTypes) => {
  const Complaint = sequelize.define('Complaint', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
     application_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending'
    },
     reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
       review_decision: {
        type: DataTypes.TEXT,
        allowNull: true
      },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    review_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'complaints',
    timestamps: false
  });

  return Complaint;
};