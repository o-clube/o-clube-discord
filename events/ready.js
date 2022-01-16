const GuildController = require('../controllers/GuildController.js');

module.exports = {
  name: 'ready',
  async execute(client) {
    for(const [id, guild] of client.guilds.cache)
    {
      GuildController.find(id);
    }
    console.log('Ready!');
  },
};
