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
Subscription.belongsTo(Teacher, { foreignKey: 'teacherId' , onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Teacher.hasMany(Subscription, { foreignKey: 'teacherId' , onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Subscription.belongsTo(User, { foreignKey: 'studentId', as: 'student' , onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Subscription, { foreignKey: 'studentId', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

module.exports = Subscription;
