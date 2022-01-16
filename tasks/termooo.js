
const fs = require('fs')
const reel = require('node-reel');
const Op = require('sequelize').Op;
const Guild = require('../models/guild.js');
const GuildTermooo = require('../models/guildTermooo.js');
const GuildMember = require('../models/guildMember.js')

const words = [];


// https://www.ime.usp.br/~pf/dicios/br-utf8.txt
// https://www.ime.usp.br/~pf/dicios/br-sem-acentos.txt
const dictionary = fs.readFileSync('data/termooo/palavras.txt', 'utf8').toString().split("\n")
const dictionaryClean = fs.readFileSync('data/termooo/palavras-sem-acento.txt', 'utf8').toString().split("\n")

for (var i = 0; i < dictionary.length; i++) {
  if (dictionary[i].length == 5) {
    words.push([dictionary[i], dictionaryClean[i]])
  }
}

module.exports = {
  name: 'termooo',
  async run(client) {
    await reel().call(async () => {
      console.log("Selecting new termooo word at " + Date.now())

      const guilds = await Guild.findAll();

      for (const guild of guilds) {
        const selectedWord = words[Math.floor(Math.random() * words.length)];

        await GuildTermooo.create(
          {
            word: selectedWord[0], word_ascii: selectedWord[1],
            guild_id: guild.id
          }
        )

        await GuildMember.update({ termooo_attempts: [], termooo_guesses: [] }, { where: { guild_id: guild.id } })
      }
    }).twiceDaily(0, 12).run();
    // }).everyMinute().run();
  },
};
