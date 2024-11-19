const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Click = sequelize.define('Click', {
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    urlId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Urls', // связь с моделью Url
            key: 'id',
        },
        allowNull: false,
    },
});

module.exports = Click;
