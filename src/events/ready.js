const GuildController = require("../controllers/GuildController.js");
const db = require("../models/index.js");
const {generateTermooos} = require("../utils/termooo.js");

module.exports = {
  name: "ready",
  async execute(client) {
    // check if servers have a available termooo
    const guildsWithoutTermooo = [];
    for (const [id, guild] of client.guilds.cache) {
      const guild = await GuildController.find(id);
      const guildTermooo = await db.guild_termooo.findOne({where: {guild_id: id}});
      if (!guildTermooo) {
        guildsWithoutTermooo.push(guild);
      }
    }
    if (guildsWithoutTermooo.length) {
      await generateTermooos(guildsWithoutTermooo);
    }


    console.log("Ready!");
  },
};
