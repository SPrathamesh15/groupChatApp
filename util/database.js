const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.SEQUELIZE_DATABASE_NAME, process.env.SEQUELIZE_DATABASE_USERNAME, process.env.SEQUELIZE_DATABASE_PASSWORD, {
    dialect:'mysql',
    host: process.env.SEQUELIZE_DATABASE_HOST
})

module.exports = sequelize;