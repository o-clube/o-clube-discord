const GuildMember = require('../models/guildMember.js');

module.exports = {
  async findOrCreateMany(guildId, members) {
    const promises = [];

    for (const m of members) {
      promises.push(GuildMember.findOrCreate({
        where: {
          guild_id: guildId,
          member_id: m,
        },
        defaults: {
          member_id: m,
          guild_id: guildId,
        },
      }),
      );
    }
    const res = await Promise.all(promises);

    return res;
  },
};
