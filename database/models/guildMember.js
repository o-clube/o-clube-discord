module.exports = (sequelize, DataTypes) => {
    return sequelize.define('guilds', {
        guild_id: {
            type: DataTypes.STRING,
        },
        member_id: {
            type: DataTypes.STRING,
        },
        last_greeting:
        {
            type: DataTypes.DATETIME,
            defaultValue: null,
        },
        birthday:
        {
            type: DataTypes.DataTypes,
            defaultValue: null,
        }
    });
};

