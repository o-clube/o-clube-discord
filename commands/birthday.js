const {bold, SlashCommandBuilder} = require('@discordjs/builders');
const {Permissions} = require('discord.js');

const GuildController = require('../controllers/GuildController.js');
const GuildMemberController = require('../controllers/GuildMemberController.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('birthday')
      .setDescription('Funcionalidades de aniversário')
      .addSubcommand((subcommand) => subcommand.setName('toggle')
          .setDescription('Selecione um canal para notifações.')
          .addChannelOption((option) => option.setName('canal').setDescription('Canal para enviar as mensagens.')))
      .addSubcommand((subcommand) => subcommand.setName('add')
          .setDescription('Adiciona ou atualiza o aniversário de um usuário.')
          .addUserOption((option) => option.setName('membro').setDescription('ID do membro.').setRequired(true))
          .addStringOption((option) => option.setName('data')
              .setDescription('Data de nascimento do membro. (dd/mm/yyyy)')
              .setRequired(true)))
      .addSubcommand((subcommand) => subcommand.setName('rm')
          .setDescription('Remove o aniversário de um usuário.')
          .addUserOption((option) => option.setName('membro').setDescription('ID do membro.').setRequired(true))),
  async execute(interaction) {
    let reply = 'Erro ao alterar as notificações de aniversários!';
    switch (interaction.options.getSubcommand()) {
      case 'toggle': {
        if (!interaction.member.permissions.has([Permissions.FLAGS.ADMINISTRATOR])) {
          return await interaction.followUp(bold('Você não possui as permissões necessárias'));
        }
        const res = await GuildController.find(interaction.guildId);

        const channel = interaction.options.getChannel('canal');
        if (channel.type !== 'GUILD_TEXT') {
          return await interaction.followUp(bold('Este canal não é de texto.'));
        }
        const rec = await res.update({birthday: channel?.id});

        if (rec) {
          reply = `Notificações de aniversários ${ res.birthday ?
            `serão enviadas em <#${channel.id}>` : 'foram desativadas'}.`;
        }
        break;
      }
      case 'add': {
        const member = await GuildMemberController.findOrCreateMany(interaction.guildId,
            [interaction.options.getMember('membro').id]);
        const date = interaction.options.getString('data');

        try {
          const [day, month, year] = date.split('/');
          member[0].birthday = new Date(`${month}/${day}/${year}`);
        } catch (error) {
          console.error(error);
          reply = 'Data inválida.';
        } finally {
          reply = 'Aniversário adicionado';
          await member[0].save();
        }
        break;
      }
      case 'rm': {
        const member = GuildMemberController.findOrCreateMany(interaction.guildId,
            [interaction.options.getMember('membro').id]);

        member[0].birthday = null;
        await member[0].save();

        reply = 'Aniversário removido.';

        break;
      }
    }
    await interaction.editReply(reply);
  },
};
