// models/Position.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Position = sequelize.define('Position', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    position_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    currently_assigned_person: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    assigned_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tenure_years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_expired: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.expiry_date) return false;
        return new Date() > new Date(this.expiry_date);
      }
    },
    years_remaining: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.expiry_date) return null;
        const diff = new Date(this.expiry_date) - new Date();
        const years = diff / (1000 * 60 * 60 * 24 * 365.25);
        return Math.max(0, parseFloat(years)).toFixed(2);
      }
    }
  }, {
    tableName: 'positions',
    timestamps: false,
    underscored: true
  });

  Position.beforeSave((position) => {
    if (position.assigned_date && position.tenure_years) {
      const date = new Date(position.assigned_date);
      date.setFullYear(date.getFullYear() + parseInt(position.tenure_years));
      position.expiry_date = date;
    }
  });

  return Position;
};
