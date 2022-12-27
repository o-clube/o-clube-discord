
// Model for new year resolutions for a guild member
// It is a many-to-many relationship between guilds and guild members
// It should have a list of uncompleted resolutions and a list of completed resolutions

"use strict";
const {
  Model,
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GuildResolutions extends Model {
    static associate(models) {
      this.belongsTo(models.guild, {foreignKey: "guild_id"});
      this.belongsTo(models.guild_member, {foreignKey: "member_id"});
    }
  }
    GuildResolutions.init({
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    member_id: {
        type: DataTypes.STRING,
        allowNull: false,
        },
    uncompleted_resolutions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    completed_resolutions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    }, {
    underscored: true,
    sequelize,
    modelName: "guild_resolutions",
    });
    return GuildResolutions;
};
