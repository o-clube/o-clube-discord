const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL)

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

const Guild = require('./models/guilds.js')(sequelize, Sequelize.DataTypes);
const Member = require('./models/member.js')(sequelize, Sequelize.DataTypes);
const GuildMember = require('./models/guildMember.js')(sequelize, Sequelize.DataTypes);

Guild.belongsToMany(Member, {through: GuildMember});
Member.belongsToMany(Guild, {through: GuildMember});
