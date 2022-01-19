const db = require("../models");

module.exports = {
  async findOrCreateMany(guildId, members) {
    const promises = [];

    for (const m of members) {
      promises.push(db.guild_member.findOrCreate({
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

    return res.map((m) => {
      return m[0];
    });
  },
};
