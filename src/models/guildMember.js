"use strict";
const {
  Model,
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GuildMember extends Model {
    static associate(models) {
      this.belongsTo(models.guild, { foreignKey: "guild_id" });
    }
  }
  GuildMember.init({
    member_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_greeting:
    {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    birthday:
    {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    termooo_rank:
    {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    termooo_attempts:
    {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    termooo_guesses:
    {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    valorant_last_match_id:
    {
      type: DataTypes.STRING,
    },
    valorant_riot_id:
    {
      type: DataTypes.STRING,
    },

  }, {
    underscored: true,
    sequelize,
    modelName: "guild_member",
  });
  return GuildMember;
};
