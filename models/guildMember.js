// const { Model, DataTypes } = require('sequelize');

// class GuildMember extends Model {
//   static init(sequelize) {
//     super.init({
//       member_id: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       last_greeting:
//       {
//         type: DataTypes.DATE,
//         defaultValue: null,
//       },
//       birthday:
//       {
//         type: DataTypes.DATE,
//         defaultValue: null,
//       },
//       termooo_rank:
//       {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       termooo_attempts:
//       {
//         type: DataTypes.ARRAY(DataTypes.STRING),
//         defaultValue: []
//       },
//       termooo_guesses:
//       {
//         type: DataTypes.ARRAY(DataTypes.STRING),
//         defaultValue: []
//       }
//     }, {
//       underscored: true,
//       sequelize,
//       modelName: 'guild_member',
//     });
//   }
// }

// module.exports = GuildMember;

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GuildMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.guild, {foreignKey: 'guild_id'});
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
  return GuildMember;
};
