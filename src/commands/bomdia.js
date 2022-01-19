const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("bomdia")
      .setDescription("Fala bom dia!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
