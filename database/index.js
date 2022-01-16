const Sequelize = require('sequelize');

const Guild = require('../models/guild.js');
const GuildMember = require('../models/guildMember.js');
const GuildTermoooo = require('../models/guildTermooo.js');

const sequelize = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`, {logging: false});

Guild.init(sequelize);
GuildMember.init(sequelize);
GuildMember.removeAttribute('id');
GuildTermoooo.init(sequelize)
GuildTermoooo.removeAttribute('id')

Guild.GuildMember = Guild.hasMany(GuildMember);
GuildMember.Guild = GuildMember.belongsTo(Guild, {foreignKey: 'guild_id'});

Guild.GuildTermoooo = Guild.hasOne(GuildTermoooo)
GuildTermoooo.Guild = GuildTermoooo.belongsTo(Guild, {foreignKey: 'guild_id'});


sequelize.sync().catch(console.error);

module.exports = sequelize;
