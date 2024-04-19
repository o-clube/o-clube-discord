const _ = require("lodash");

const {readdir} = require("fs/promises");

const GuildController = require("../controllers/GuildController.js");
// eslint-disable-next-line max-len
const GuildMemberController = require("../controllers/GuildMemberController.js");
const db = require("../models");
const {playSound} = require("../utils/voice.js");

module.exports = {
  name: "voiceStateUpdate",
  async execute(before, after) {
    if (before.channelId === null &&
      after.channelId !== null &&
      !after.member.user.bot &&
      !after.deaf) {
      const channel = after.member.voice.channel;
      const members = [...channel.members.keys()];

      const sinoId = "175419762359271424";
      const perinniId = "752232304948281495";

      if ((members.includes(sinoId) || members.includes(perinniId)) && [sinoId, perinniId].includes(after.member.id)) {
        playSound("./data/welcome/somos_todos_macacos.mp3", channel);
        return;
      }

      let res = await GuildController.find(channel.guild.id);

      if (!res.greetings) {
        return;
      }

      // eslint-disable-next-line max-len
      res = await GuildMemberController.findOrCreateMany(channel.guild.id,
          [after.member.id]);

      const now = Date.now();

      const joinedMember = res[0];

      if (now - joinedMember.last_greeting?.getTime() <= 12 * 3600 * 1000) {
        return;
      }

      // eslint-disable-next-line max-len
      await GuildMemberController.findOrCreateMany(channel.guild.id, members);

      await db.guild_member.update({last_greeting: now},
          {
            where: {
              member_id: members,
              guild_id: channel.guild.id,
            },
          });

      try {
        const date = new Date();
        const hour = date.getHours();

        let folder = "night";
        if (4 <= hour && hour < 12) {
          folder = "morning";
        } else if ( 12 <= hour && hour < 13) {
          folder = "special";
        } else if ( 13 <= hour && hour < 18) {
          folder = "evening";
        }

        const folderPath = `./data/welcome/${folder}`;
        const fileList = await readdir(folderPath);
        const file = _.sample(fileList);


        playSound(`${folderPath}/${file}`, channel);
      } catch (error) {
        console.log(error);
      }
    }
  },
};
