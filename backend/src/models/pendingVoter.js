const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PendingVoter = sequelize.define("PendingVoter", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    election_id: {                  
      type: DataTypes.INTEGER,
      allowNull: true
    },
    activation_token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "pending_voters",
    timestamps: false,
    underscored: true
  });

  return PendingVoter;
};