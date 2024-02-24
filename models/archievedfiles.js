const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const archievedFiles = sequelize.define('archievedFile', {
    userName: {
        type: Sequelize.STRING,
        allowNull: false
        },
    fileName: {
    type: Sequelize.STRING,
    allowNull: false
    },
    fileURL: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timeStamp: {
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

module.exports = archievedFiles;
