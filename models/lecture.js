const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Teacher = require("./teacher");

const Lecture = sequelize.define("lecture", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true
});

Lecture.belongsTo(Teacher, { foreignKey: 'teacherId' , onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Teacher.hasMany(Lecture, { foreignKey: 'teacherId', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

module.exports = Lecture;
