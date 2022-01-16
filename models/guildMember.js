const { Model, DataTypes } = require('sequelize');

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
        defaultValue: []
      },
      termooo_guesses:
      {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
      }
    }, {
      underscored: true,
      sequelize,
      modelName: 'guild_member',
    });
  }
}

module.exports = GuildMember;
