const GuildMemberController = require("../controllers/GuildMemberController");
const GuildController = require("../controllers/GuildController");
const {EmbedBuilder} = require("discord.js");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    await GuildMemberController.findOrCreateMany(member.guild.id,
        [member.id]);

    const guild = await GuildController.find(member.guild.id);

    if (!guild.announcement) {
      return;
    }
    const channel = member.client.channels.cache.get(guild.announcement);

    const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({name: member.user.tag, iconURL: member.displayAvatarURL()})
        .setThumbnail(member.displayAvatarURL())
        .setDescription("Saiu do servidor");

    channel.send({embeds: [embed]});
  },
};
