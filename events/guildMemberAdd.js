const GuildMemberController = require('../controllers/GuildMemberController');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    await GuildMemberController.findOrCreateMany(member.guild.id,
        [member.id]);
    console.log(`${member.user.username} joined ${member.guild.name}`);
  },
};
