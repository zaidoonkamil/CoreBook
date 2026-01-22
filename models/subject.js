const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Class = require("./class");

const Subject = sequelize.define("subject", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true
});

Subject.belongsTo(Class, { foreignKey: 'classId', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Class.hasMany(Subject, { foreignKey: 'classId', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

module.exports = Subject;
