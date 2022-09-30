const {SlashCommandBuilder} = require("@discordjs/builders");
const {rastrearEncomendas} = require("correios-brasil");
const {EmbedBuilder} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("correios")
      .setDescription("Retorna o status de um pacote do correios! (Separar múltiplos códigos por virgula)")
      .addStringOption((option) => option.setName("codigo")
          .setDescription("Código de rastreio")
          .setRequired(true)),
  async execute(interaction) {
    const cod = interaction.options.getString("codigo");

    const embeds = await rastrearEncomendas(cod.split(",")).then((tracks) => {
      const embeds = [];
      for (const track of tracks) {
        const fields = track.eventos.reverse().map((event)=>{
          // TODO: fix undefineds
          let msgBody = `${event.unidade.tipo}, ${event.unidade.endereco.cidade} - ${event.unidade.endereco.uf}`;
          if (event.unidadeDestino) {
            msgBody = msgBody + `\n${event.unidadeDestino.tipo}, ${event.unidadeDestino.endereco.cidade} 
            - ${event.unidadeDestino.endereco.uf}`;
          }

          return {name: event.descricao, value: msgBody + `\n*[${event.dtHrCriado}]*`};
        });

        const embed = new EmbedBuilder()
            .setColor(track.eventos.find((event) => {
              return event.descricao.includes("entregue ao destinatário");
            }) ? "DarkBlue" : "DarkGold")
            .setAuthor({name: track.codObjeto})
            .addFields(fields);

        embeds.push(embed);
      }
      return embeds;
    });

    await interaction.reply({embeds}, {ephemeral: true});
  },
};
