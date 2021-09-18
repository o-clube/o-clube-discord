const Guild = require('../models/guild.js');


module.exports = {
  async find(guildId) {
    const [guild, created] = await Guild.findOrCreate(
        {
          where: {id: guildId},
          defaults: {id: guildId},
        }).catch((err) => {
      console.log(err);
    });

    return guild;
  },
};
