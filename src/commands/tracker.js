const GuildMemberController = require("../controllers/GuildMemberController");
const {bold, SlashCommandBuilder} = require("@discordjs/builders");
const {ChannelType, PermissionsBitField} = require("discord.js");
const GuildController = require("../controllers/GuildController.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("valorant")
        .setDescription("Funcionalidades tracker valorant.")
        .addSubcommand((subcommand) => subcommand.setName("toggle")
            .setDescription("Selecione um canal para notifações.")
            .addChannelOption((option) => option.setName("canal").setDescription("Canal para enviar as mensagens.")
                .setRequired(true)))
        .addSubcommand((subcommand) => subcommand.setName("link")
            .setDescription("Associe uma conta Valorant à sua conta do discord.")
            .addStringOption((option) =>
                option.setName("riotid")
                    .setDescription("Nome da conta e id riot. Exemplo: Belzy#00000")
                    .setRequired(true))),


    async execute(interaction) {
        let reply = "Erro ao alterar as notificações de valorant!";
        switch (interaction.options.getSubcommand()) {
            case "toggle": {
                if (!interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) {
                    return await interaction.followUp(bold("Você não possui as permissões necessárias"));
                }
                const res = await GuildController.find(interaction.guildId);

                const channel = interaction.options.getChannel("canal");
                if (channel && channel.type !== ChannelType.GuildText) {
                    return await interaction.followUp(bold("Este canal não é de texto."));
                }
                const rec = await res.update({ valorant: channel?.id });

                if (rec) {
                    reply = `Notificações de valorant ${res.valorant ?
                        `serão enviadas em <#${channel.id}>` : "foram desativadas"}.`;
                }
                break;
            }
            case "link": {
                const riotId = interaction.options.getString("riotid");
                const user = await interaction.member;
                const member = await GuildMemberController.findOrCreateMany(interaction.guildId,
                    [user.id]);
                console.log(user)
                console.log(member)
                member[0].valorant_riot_id = riotId
                await member[0].save();
                reply = `Usuário ${user} linkado à conta riot ${riotId} com sucesso`
            }
        }

        await interaction.reply(reply)
    },
};
