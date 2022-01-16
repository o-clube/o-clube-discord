// const {Model, DataTypes} = require('sequelize');

// class Guild extends Model {
//   static init(sequelize) {
//     super.init({
//       id: {
//         type: DataTypes.STRING,
//         primaryKey: true,
//       },
//       greetings: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//       },
//       birthday: {
//         type: DataTypes.STRING,
//         defaultValue: null,
//       },
//     }, {
//       underscored: true,
//       sequelize,
//       modelName: 'guild',
//     });
//   }
// }

// module.exports = Guild;


'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guild extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
  }, {
    underscored: true,
    sequelize,
    modelName: 'guild',
  });
  return Guild;
};
