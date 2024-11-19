const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Click = require('./Click'); // Подключаем модель Click

const Url = sequelize.define('Url', {
    originalUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shortId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

Url.hasMany(Click, { foreignKey: 'urlId' });

module.exports = Url;