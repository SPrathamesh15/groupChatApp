const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const archievedMessages = sequelize.define('archievedMessage', {
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
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
});

module.exports = archievedMessages;
