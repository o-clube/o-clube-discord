const reel = require("node-reel");
const Op = require("sequelize").Op;
const { EmbedBuilder } = require("discord.js");
const db = require("../models");
const axios = require("axios")
const BASE_URL = 'https://api.henrikdev.xyz/valorant';

async function getRankInfo(riotId) {
    try {
        const response = await axios.get(`${BASE_URL}/v1/mmr-history/br/${riotId[0]}/${riotId[1]}`);
        return response.data.data;
    } catch (error) {
        console.error(`Failed to get rank info: ${error}`);
    }
}

async function getMatchInfo(matchId) {
    try {
        const response = await axios.get(`${BASE_URL}/v2/match/${matchId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Failed to get match info: ${error}`);
    }
}

async function processMember(member, channel, client) {
    const riotId = member.valorant_riot_id.split('#');
    const rankInfo = await getRankInfo(riotId);
    const matchId = rankInfo[0].match_id;

    if (member.valorant_last_match_id !== matchId) {
        member.valorant_last_match_id = matchId;
        const matchInfo = await getMatchInfo(matchId);
        const player = matchInfo.players.all_players.find(player => player.name.toLowerCase() === riotId[0].toLowerCase());
        const combatScore = Math.round(player.stats.score / matchInfo.metadata.rounds_played);
        const agentImg = player.assets.agent.small
        const user = await client.users.fetch(member.member_id, { cache: true });
        const userAvatar = user.avatarURL()
        const weewoo = client.emojis.cache.get("857132785436196875")
        const playerRank = rankInfo.data.data[0].currenttierpatched
        const rankIcon = rankInfo.data.data[0].images.small
        const embed = new EmbedBuilder()
            .setTitle(`Valorant Tracker - ${matchInfo.metadata.mode} - ${matchInfo.metadata.map}`)
            .setThumbnail(userAvatar)
            .setImage(agentImg)
            .setDescription(`${user} jogou uma partida de valorant! ${weewoo}`)
            .setFooter({ text: `Rank atual: ${playerRank}`, iconURL: rankIcon })
            .addFields(
                { name: "Kills", value: `${player.stats.kills}`, inline: true },
                { name: "Deaths", value: `${player.stats.deaths}`, inline: true },
                { name: "Assists", value: `${player.stats.assists}`, inline: true },
                { name: "Combat Score", value: `${combatScore}`, inline: true },
            )
            .setTimestamp()
        await channel.send({ embeds: [embed] })
        await member.save()
    }
}

module.exports = {


    name: "valorant_tracker",
    async run(client) {
        await reel().call(async () => {

            const guilds = await db.guild.findAll({
                where: {
                    valorant: {
                        [Op.ne]: null
                    }
                }
            })

            for (const guild of guilds) {
                const members = await db.guild_member.findAll({
                    where: {
                        valorant_riot_id: {
                            [Op.ne]: null
                        }
                    }
                })
                const channel = client.channels.cache.find((ch) => {
                    return ch.id === guild.valorant;
                });


                for (const member of members) {
                    await processMember(member, channel, client)
                }

            }
        }
        ).everyMinute().run();
    },
};