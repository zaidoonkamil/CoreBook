const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Lecture = require("./lecture");

const Chapter = sequelize.define("chapter", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  attachment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lectureId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true
});

Chapter.belongsTo(Lecture, { foreignKey: 'lectureId' });
Lecture.hasMany(Chapter, { foreignKey: 'lectureId' });

module.exports = Chapter;
