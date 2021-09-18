const {SlashCommandBuilder} = require('@discordjs/builders');

const GuildController = require('../controllers/GuildController.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('greetings')
      .setDescription('Ativa/desativa a saudação!'),
  async execute(interaction) {
    let reply = 'Erro ao alterar a saudação!';

    const res = await GuildController.find(interaction.guildId);

    const rec = await res.update({greetings: !res.greetings});

    if (rec) {
      reply = `Saudação foi ${ res.greetings ? 'ativada' : 'desativada'}.`;
    }

    await interaction.editReply(reply);
  },
};
