const {bold, SlashCommandBuilder} = require('@discordjs/builders');
const {Permissions} = require('discord.js');

const GuildController = require('../controllers/GuildController.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('greetings')
      .setDescription('Ativa/desativa a saudação!'),
  async execute(interaction) {
    if (!interaction.member.permissions.has([Permissions.FLAGS.ADMINISTRATOR])) {
      return await interaction.followUp(bold('Você não possui as permissões necessárias'));
    }

    let reply = 'Erro ao alterar a saudação!';

    const res = await GuildController.find(interaction.guildId);

    const rec = await res.update({greetings: !res.greetings});

    if (rec) {
      reply = `Saudação foi ${ res.greetings ? 'ativada' : 'desativada'}.`;
    }

    await interaction.followUp(reply);
  },
};
