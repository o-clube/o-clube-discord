const guildSchema = require("../database/models/guild.js");

module.exports = {
    name: 'ready',
    async execute(client) {
        for(const [guildId, guild] of client.guilds.cache)
        {
            guildDB = await client.db.getGuild(guildId);
            const members = await guild.members.fetch();
            for(const [memberId, member] of members)
            {
                memberDB = await guildSchema.findOne({id: guildId, "members.id": memberId})
                if(!memberDB){
                    guildDB.members.push({id: memberId})
                }
            }
            await guildDB.save()
        }
    },
};
