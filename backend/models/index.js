const { Sequelize } = require('sequelize');
const path = require('path');

// Настройка подключения к SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
});

module.exports = sequelize;
