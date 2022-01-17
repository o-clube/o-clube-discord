
const fs = require('fs')
const db = require('../models');

exports.generateTermooos = async function(guilds) {
  console.log("Selecting new termooo word at " + Date.now())

  const words = []

  // http://www.nilc.icmc.usp.br/nilc/projects/unitex-pb/web/dicionarios.html
  const dictionary = fs.readFileSync('data/termooo/palavras.txt', 'utf8').toString().split("\n")
  const dictionaryClean = fs.readFileSync('data/termooo/palavras-sem-acento.txt', 'utf8').toString().split("\n")

  for (var i = 0; i < dictionary.length; i++) {
    if (dictionary[i].length == 5) {
      words.push([dictionary[i].toLowerCase(), dictionaryClean[i].toLowerCase()])
    }
  }
  if(!guilds)
    guilds = await db.guild.findAll();

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
}

