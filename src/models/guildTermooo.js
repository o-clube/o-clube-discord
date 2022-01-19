"use strict";
const {
  Model,
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GuildTermooo extends Model {
    static associate(models) {
      this.belongsTo(models.guild, {foreignKey: "guild_id"});
    }
  }
  GuildTermooo.init({
    word: {
      type: DataTypes.STRING,
    },
    word_ascii: {
      type: DataTypes.STRING,
      defaultValue: false,
    },
  }, {
    underscored: true,
    sequelize,
    modelName: "guild_termooo",
  });
  return GuildTermooo;
};
