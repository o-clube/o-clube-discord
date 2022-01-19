const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("correios")
      .setDescription("Retorna o status de um pacote do correios!")
      .addStringOption((option) => option.setName("codigo")
          .setDescription("Código de rastreio")
          .setRequired(true)),
  async execute(interaction) {
    const cod = interaction.options.getString("codigo");

    await interaction.reply({content: "Disabled"}, {ephemeral: true});
  },
};
