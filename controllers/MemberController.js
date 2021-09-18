const Guild = require('../models/guild.js');
const Member = require('../models/member.js');


module.exports = {
  async find(memberId, guildId = null) {
    const [res, created] = await Member.findOrCreate({
      where: {id: memberId},
      defaults: {id: memberId},
    });

    if (guildId) {
      res.addGuild(guildId);
    }

    return res;
  },

  async findGuildMembers(members, guildId) {
    const res = await Member.findAll({
      where: {id: members},
      include: [{
        model: Guild,
        through: {
          where: {
            guild_id: guildId,
          },
        },
      }],
    });

    return res;
  },
};
