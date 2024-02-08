const User = require('../models/signup')
const sequelize = require('../util/database')
const Messages = require('../models/messages')

exports.postAddMessage = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const name = req.user.username;
        const messages = req.body.messageContent;
        const time = req.body.time;
        const userId = req.user.id;
        // Creating a new message
        console.log('name',name)

        const Details = await Messages.create(
        {
            name: name,
            message: messages,
            time: time,
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

exports.getAllMessages = async (req, res, next) => {
    try {
        // Fetch all messages from the database
        const allMessages = await Messages.findAll();
        
        res.status(200).json({ messages: allMessages });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};
