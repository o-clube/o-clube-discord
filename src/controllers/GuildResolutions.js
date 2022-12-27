// controller for guild resolutions

const db = require("../models");

module.exports = {
    async findOrCreateMany(guildId, members) {
        const promises = [];

        for (const m of members) {
            promises.push(db.guild_resolutions.findOrCreate({
                where: {
                    guild_id: guildId,
                    member_id: m,
                },
                defaults: {
                    member_id: m,
                    guild_id: guildId,
                },
            }),
            );
        }
        const res = await Promise.all(promises);

        return res.map((m) => {
            return m[0];
        });
    },

// insert a new value for a uncompleted resolution for a guild member
// uncompleted resolution is an array of strings, so we need to push the new value into the array
// then we need to update the database with the new array

async insertUncompletedResolution(guildId, memberId, newResolution) {
    const resolutions = await db.guild_resolutions.findOne({
        where: {
            guild_id: guildId,
            member_id: memberId,
        },
    });
    resolutions.uncompleted_resolutions.push(newResolution);
    await resolutions.save();
},

// insert a new value for a completed resolution for a guild member
// completed resolution is an array of strings, so we need to push the new value into the array
// and we need to remove the value from the uncompleted resolutions array

async insertCompletedResolution(guildId, memberId, newResolution) {
    const resolutions = await db.guild_resolutions.findOne({
        where: {
            guild_id: guildId,
            member_id: memberId,
        },
    });
    resolutions.completed_resolutions.push(newResolution);
    resolutions.uncompleted_resolutions = resolutions.uncompleted_resolutions.filter((resolution) => resolution !== newResolution);
    await resolutions.save();
},

// remove a value from the uncompleted resolutions array

async removeUncompletedResolution(guildId, memberId, resolution) {
    const resolutions = await db.guild_resolutions.findOne({
        where: {
            guild_id: guildId,
            member_id: memberId,
        },
    });
    resolutions.uncompleted_resolutions = resolutions.uncompleted_resolutions.filter((res) => res !== resolution);
    await resolutions.save();
},

// remove a value from the completed resolutions array

async removeCompletedResolution(guildId, memberId, resolution) {
    const resolutions = await db.guild_resolutions.findOne({
        where: {
            guild_id: guildId,
            member_id: memberId,
        },
    });
    resolutions.completed_resolutions = resolutions.completed_resolutions.filter((res) => res !== resolution);
    await resolutions.save();
},

// get all resolutions for a guild member

async getResolutions(guildId, memberId) {
    const resolutions = await db.guild_resolutions.findOne({
        where: {
            guild_id: guildId,
            member_id: memberId,
        },
    });
    return resolutions;
},

// get all uncompleted resolutions for a guild member

async getUncompletedResolutions(guildId, memberId) {
    const resolutions = await db.guild_resolutions.findOne({
        where: {
            guild_id: guildId,
            member_id: memberId,
        },
    });
    return resolutions.uncompleted_resolutions;
},

// get all completed resolutions for a guild member

async getCompletedResolutions(guildId, memberId) {
    const resolutions = await db.guild_resolutions.findOne({
        where: {
            guild_id: guildId,
            member_id: memberId,
        },
    });
    return resolutions.completed_resolutions;
},



};
