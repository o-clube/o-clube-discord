module.exports = (sequelize, DataTypes) => {
    return sequelize.define('guilds', {
        id: {
            type: DataTypes.STRING,
            unique: true,
        },
        greetings: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        birthday: {
            type: DataTypes.STRING,
            defaultValue: null,
        }}
    );
};

