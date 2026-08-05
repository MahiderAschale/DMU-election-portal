module.exports = (sequelize, DataTypes) => {
  const VotingCard = sequelize.define("VotingCard", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    election_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    card_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "voting_cards",
    timestamps: false
  });

  return VotingCard;
};