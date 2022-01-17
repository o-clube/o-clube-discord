const { Guild } = require('discord.js');
const GuildController = require('../controllers/GuildController.js');
const db = require('../models/index.js');
const { generateTermooos } = require('../utils/termooo.js')

module.exports = {
  name: 'ready',
  async execute(client) {

    // check if servers have a available termooo
    const guilds_without_termooo = []
    for (const [id, guild] of client.guilds.cache) {
      const guild = await GuildController.find(id);
      const guild_termooo = await db.guild_termooo.findOne({ where: { guild_id: id } })
      if (!guild_termooo)
        guilds_without_termooo.push(guild)
    }
    if (guilds_without_termooo.length)
      await generateTermooos(guilds_without_termooo)


    console.log('Ready!');
  },
};
