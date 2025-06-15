const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Class = sequelize.define("class", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
      },
}, {
    timestamps: true
});

module.exports = Class;
  