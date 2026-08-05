const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ManifestoSession = sequelize.define('ManifestoSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    election_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    meeting_link: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'manifesto_sessions',
    timestamps: false,
    underscored: true
  });

  return ManifestoSession;
};
