module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        id: {
            type: DataTypes.STRING,
            unique: true,
        },
    );
};

