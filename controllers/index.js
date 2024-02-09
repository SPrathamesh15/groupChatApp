const User = require('../models/signup')
const sequelize = require('../util/database')
const Messages = require('../models/messages')
const { Op } = require('sequelize');

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


exports.getNewMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.lastMessageId || -1; // Get the last message ID from the query parameter

        // Fetch only the new messages with IDs greater than the last message ID
        const newMessages = await Messages.findAll({
            where: {
                id: {
                    [Op.gt]: lastMessageId // Fetch messages with IDs greater than the last message ID
                }
            }
        });

        res.status(200).json({ messages: newMessages });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};
