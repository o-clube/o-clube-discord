const {Model, DataTypes} = require('sequelize');

class Guild extends Model {
  static init(sequelize) {
    super.init({
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
    }, {
      underscored: true,
      sequelize,
      modelName: 'guild',
    });
  }
}

module.exports = Guild;

