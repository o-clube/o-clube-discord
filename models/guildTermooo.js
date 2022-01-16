const {Model, DataTypes} = require('sequelize');

class GuildTermooo extends Model {
  static init(sequelize) {
    super.init({
      word: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      word_ascii: {
        type: DataTypes.STRING,
        defaultValue: false,
      },
    }, {
      underscored: true,
      sequelize,
      modelName: 'guild_termooo',
    });
  }
}

module.exports = GuildTermooo;

