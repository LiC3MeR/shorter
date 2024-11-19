const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Url = require('./Url'); // Импортируем модель Url для связи

const Click = sequelize.define('Click', {
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    urlId: {
        type: DataTypes.INTEGER,
        references: {
            model: Url,
            key: 'id',
        },
        allowNull: false,
    },
}, {
    timestamps: true, // добавляем метки времени
});

module.exports = Click;