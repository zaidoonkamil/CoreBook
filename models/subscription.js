const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Teacher = require("./teacher");
const User = require("./user");

const Subscription = sequelize.define("subscription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending' // pending | active | rejected
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true
});

// ربط الاشتراك بالأستاذ
Subscription.belongsTo(Teacher, { foreignKey: 'teacherId' });
Teacher.hasMany(Subscription, { foreignKey: 'teacherId' });

Subscription.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
User.hasMany(Subscription, { foreignKey: 'studentId' });

module.exports = Subscription;
