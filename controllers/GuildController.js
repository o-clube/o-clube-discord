const db = require('../models');


module.exports = {
  async find(guildId) {
    const [guild, created] = await db.guild.findOrCreate(
        {
          where: {id: guildId},
          defaults: {id: guildId},
        }).catch((err) => {
      console.log(err);
    });

    return guild;
  },
};
