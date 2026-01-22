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
  price: {                          
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: false,
  }}, {
  timestamps: true
});

Teacher.belongsTo(Subject, { foreignKey: 'subjectId' , onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Subject.hasMany(Teacher, { foreignKey: 'subjectId', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

module.exports = Teacher;
