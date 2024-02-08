const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const messages = sequelize.define('message', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
        },
    message: {
    type: Sequelize.STRING,
    allowNull: false
    },
    time: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = messages;
