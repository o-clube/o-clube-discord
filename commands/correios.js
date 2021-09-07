const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Correios = require('correios.js'); // TODO: Find better lib or rewrite

module.exports = {
    data: new SlashCommandBuilder()
        .setName('correios')
        .setDescription('Retorna o status de um pacote do correios!')
        .addStringOption(option => option.setName('codigo')
            .setDescription('Código de rastreio')
            .setRequired(true)),
    async execute(interaction) {
        const cod = interaction.options.getString('codigo')
        const correios = new Correios();
        const package = await correios.track(cod)

        const a = package['events'].map((v) => {
            return { 'name': `${v.date} - ${v.hour} - ${v.location}`, value: `${v.event}\n${v.message}` };
        })

        const embed = new MessageEmbed()
            .setColor("DARK_YELLOW")
            .setTitle(cod)
            .addFields(a)

        await interaction.editReply({ embeds: [embed] })
    },
};
