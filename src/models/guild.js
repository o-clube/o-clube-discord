"use strict";
const {
  Model,
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Guild extends Model {
    static associate(models) {
    }
  }
  Guild.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    greetings: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    birthday: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    announcement: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    valorant: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  }, {
    underscored: true,
    sequelize,
    modelName: "guild",
  });
  return Guild;
};
