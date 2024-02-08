const User = require('../models/signup')
const sequelize = require('../util/database')
const Messages = require('../models/messages')

exports.postAddMessage = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const messages = req.body.messageContent;
        const userId = req.user.id;
        // Creating a new message
        const Details = await Messages.create(
        {
            message: messages,
            userId: userId,
        },
        { transaction: t }
        );

        await t.commit();

        res.status(201).json({ newMessageDetails: Details });
        console.log('Messages added to server');
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};