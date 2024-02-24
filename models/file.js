const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const fileDetails = sequelize.define('file', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
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
    fileName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timeStamp: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = fileDetails;
