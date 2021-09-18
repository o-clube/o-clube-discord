const {Model, DataTypes} = require('sequelize');

class GuildMember extends Model {
  static init(sequelize) {
    super.init({
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
        type: DataTypes.DATEONLY,
        defaultValue: null,
      },
    }, {
      underscored: true,
      sequelize,
      modelName: 'guild_member',
    });
  }
}

module.exports = GuildMember;
