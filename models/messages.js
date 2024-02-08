const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const messages = sequelize.define('message', {
    message: {
    type: Sequelize.STRING,
    allowNull: false
    },
});

module.exports = messages;
