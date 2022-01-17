
const fs = require('fs')
const reel = require('node-reel');
const Op = require('sequelize').Op;
const db = require('../models');

const words = []

// https://raw.githubusercontent.com/pythonprobr/palavras/master/palavras.txt
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

      const guilds = await db.guild.findAll();

      for (const guild of guilds) {
        const selectedWord = words[Math.floor(Math.random() * words.length)];

        await db.guild_termooo.create(
          {
            word: selectedWord[0], word_ascii: selectedWord[1],
            guild_id: guild.id
          }
        )

        await db.guild_member.update({ termooo_attempts: [], termooo_guesses: [] }, { where: { guild_id: guild.id } })
      }
    }).twiceDaily(9, 21).run();
  },
};
