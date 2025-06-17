const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Subject = require("./subject");

const Teacher = sequelize.define("teacher", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: false,
  }}, {
  timestamps: true
});

Teacher.belongsTo(Subject, { foreignKey: 'subjectId' });
Subject.hasMany(Teacher, { foreignKey: 'subjectId' });

module.exports = Teacher;
