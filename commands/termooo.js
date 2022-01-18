const {SlashCommandBuilder} = require("@discordjs/builders");
const GuildMemberController = require("../controllers/GuildMemberController");
const {createCanvas} = require("canvas");
const {roundRect} = require("../utils/canvas.js");
const fs = require("fs");
const Sequelize = require("sequelize");
const db = require("../models");

const dictionary = fs.readFileSync("data/termooo/palavras.txt", "utf8").toString().split("\n");
const dictionaryClean = fs.readFileSync("data/termooo/palavras-sem-acento.txt", "utf8").toString().split("\n");


function displayPublicTermooo(attempts) {
  let reply = "";
  for (let j = 0; j < attempts.length; j++) {
    for (let i = 0; i < attempts[j].length; i++) {
      if (attempts[j][i] == "2") {
        reply += ":green_square:";
      } else if (attempts[j][i] == "1") {
        reply += ":yellow_square:";
      } else {
        reply += ":black_large_square:";
      }
    }
    reply += "\n";
  }
  return reply;
}
function displayTermooResults(attempts, guesses) {
  const size = 48;
  const spacing = 4;

  let rectX = 0;
  let rectY = 0;

  const canvas = createCanvas(size * 5 + spacing * 4, size * attempts.length + ((attempts.length - 1) * spacing));
  const ctx = canvas.getContext("2d");

  ctx.lineWidth = spacing;
  ctx.font = "600 28px Mitr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let j = 0; j < attempts.length; j++) {
    for (let i = 0; i < attempts[j].length; i++) {
      if (attempts[j][i] == "2") {
        ctx.fillStyle = "#3aa394";
      } else if (attempts[j][i] == "1") {
        ctx.fillStyle = "#d3ad69";
      } else {
        ctx.fillStyle = "#312a2c";
      }
      roundRect(ctx, rectX, rectY, size, size, size * 0.10, true, false);
      ctx.fillStyle = "#fff";
      ctx.fillText(guesses[j][i].toUpperCase(), rectX + (size / 2), rectY + (size / 2));
      rectX = rectX + size + 4;
    }
    rectY = rectY + size + 4;
    rectX = 0;
  }

  buffer = canvas.toBuffer("image/png");
  return buffer;
}

function getIndicesOf(searchStr, str) {
  const searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  let startIndex = 0; let index; const indices = [];

  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}


module.exports = {
  data: new SlashCommandBuilder()
      .setName("termooo")
      .setDescription("Jogue termooo")
      .addStringOption((option) => option.setName("tentativa")
          .setDescription("Sua tentativa")
          .setRequired(false)),
  async execute(interaction) {
    const member = interaction.member;
    // check for attempts check for guild

    const res = await GuildMemberController.findOrCreateMany(member.guild.id,
        [member.id]);
    const dbMember = res[0];

    const termooo = await db.guild_termooo.findOne({
      where: {guild_id: member.guild.id},
      order: [["created_at", "DESC"]],
    });

    const word = termooo.word_ascii.toLowerCase();
    const guess = interaction.options.getString("tentativa").toLowerCase();

    if (!guess || dbMember.termooo_attempts.length == 6 || dbMember.termooo_guesses.at(-1) == word) {
      await interaction.reply({
        content: termooo.word,
        files: [displayTermooResults(dbMember.termooo_attempts,
            dbMember.termooo_guesses)], ephemeral: true,
      });
      return await interaction.client.channels.cache.get(interaction.channelId)
          .send(`<@${member.id}> *- Pontos: ${dbMember.termooo_rank}*\n` +
          displayPublicTermooo(dbMember.termooo_attempts));
    }

    // check if guess exists in tesseract
    if (guess.length != 5) {
      return await interaction.reply({content: "A palavra deve conter 5 letras.", ephemeral: true});
    }
    const validIdx = dictionaryClean.indexOf(guess);

    if (validIdx === -1) {
      return await interaction.reply({content: "Palavra inválida.", ephemeral: true});
    }

    const aux = ["0", "0", "0", "0", "0"];
    for (let i = 0; i < 5; i++) {
      const correct = word[i];
      const attempt = guess[i];
      if (attempt === correct) {
        aux[i] = "2";
      } else {
        const idxs = getIndicesOf(attempt, word);
        if (idxs.length) {
          for (const idx of idxs) {
            if (aux[idx] != "2") {
              aux[i] = "1";
            }
          }
        }
      }
    }

    dbMember.termooo_attempts.push(aux.join(""));

    const rank = 7;

    dbMember.termooo_guesses.push(dictionary.at(validIdx));

    const reply = {
      files: [displayTermooResults(dbMember.termooo_attempts,
          dbMember.termooo_guesses)], ephemeral: true,
    };

    if (dbMember.termooo_attempts.length == 6) {
      reply["content"] = termooo.word;
    }

    await interaction.reply(reply);

    if (guess == word || dbMember.termooo_attempts.length == 6) {
      dbMember.termooo_rank = dbMember.termooo_rank + rank - dbMember.termooo_attempts.length;
      return await interaction.client.channels.cache.get(interaction.channelId)
          .send(`<@${member.id}> *- Pontos: ${dbMember.termooo_rank}*\n` +
          displayPublicTermooo(dbMember.termooo_attempts));
    }

    await db.guild_member.update({
      termooo_attempts: Sequelize.fn("array_append", Sequelize.col("termooo_attempts"), aux.join("")),
      termooo_guesses: Sequelize.fn("array_append", Sequelize.col("termooo_guesses"), dictionary.at(validIdx)),
      termooo_rank: dbMember.termooo_rank,
    }, {where: {member_id: member.id, guild_id: member.guild.id}});
  },
};
