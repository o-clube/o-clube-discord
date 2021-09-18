const Sequelize = require('sequelize');

const Guild = require('../models/guild.js');
const GuildMember = require('../models/guildMember.js');

const sequelize = new Sequelize(process.env.DATABASE_URL, {logging: false});

Guild.init(sequelize);
GuildMember.init(sequelize);
GuildMember.removeAttribute('id');

Guild.GuildMember = Guild.hasMany(GuildMember);
GuildMember.Guild = GuildMember.belongsTo(Guild, {foreignKey: 'guild_id'});

sequelize.sync().catch(console.error);

module.exports = sequelize;
