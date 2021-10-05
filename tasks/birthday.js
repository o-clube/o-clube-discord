const Op = require('sequelize').Op;
const {MessageEmbed} = require('discord.js');
const sequelize = require('sequelize');
const reel = require('node-reel');
const Guild = require('../models/guild.js');
const GuildMember = require('../models/guildMember.js');


module.exports = {
  name: 'birthday',
  async run(client) {
    await reel().call(async () => {
      const guilds = await Guild.findAll({
        where: {
          birthday: {
            [Op.ne]: null,
          },
        },
      });
      const today = new Date();

      for (const guild of guilds) {
        const members = await GuildMember.findAll({
          where: {
            [Op.and]: [
              sequelize.where(sequelize.fn('date_part', 'day', sequelize.col('birthday')), today.getDate()),
              sequelize.where(sequelize.fn('date_part', 'month', sequelize.col('birthday')), today.getMonth() + 1),
              sequelize.where(sequelize.col('guild_id'), guild.id),
            ],
          },
        });

        const channel = client.channels.cache.find((ch) => {
          return ch.id === guild.birthday;
        });
        if (members.lenght) {
          const embed = new MessageEmbed()
              .setColor('RANDOM')
              .setTitle('FELIZ ANIVERSÁRIO!!'); // TODO: use emojis without unicode in code
          let description = '🥳🎈🎂🎉\n@everyone';
          for (const member of members) {
            description += `\n<@${member.member_id}> **(${today.getFullYear() - member.birthday.getFullYear()})**`;
          }
          embed.setDescription(description);

          await channel.send({embeds: [embed]});
        }
      }
    }).daily().run();
  },
};
