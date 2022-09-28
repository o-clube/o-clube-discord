const {bold, SlashCommandBuilder} = require("@discordjs/builders");
const {ChannelType, PermissionsBitField} = require("discord.js");

const GuildController = require("../controllers/GuildController.js");


module.exports = {
  data: new SlashCommandBuilder()
      .setName("announcement")
      .setDescription("Configura o canal para mensagens do bot")
      .addChannelOption((option) => option.setName("canal").setDescription("Canal para enviar as mensagens.")
          .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) {
      return await interaction.reply(bold("Você não possui as permissões necessárias"));
    }

    const res = await GuildController.find(interaction.guildId);

    const channel = interaction.options.getChannel("canal");

    if (channel && channel.type !== ChannelType.GuildText) {
      return await interaction.followUp(bold("Este canal não é de texto."));
    }
    const rec = await res.update({announcement: channel?.id ?? null});


    if (rec) {
      reply = `Mensagens do bot ${ res.announcement ?
          `serão enviadas em <#${channel.id}>` : "foram desativadas"}.`;
    }

    await interaction.reply(reply);
  },
};
