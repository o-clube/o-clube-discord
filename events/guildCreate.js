const GuildController = require('../controllers/GuildController.js');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    GuildController.find(guild.id);
    console.log(`Joined guild: ${guild.name}`);
  },
};
