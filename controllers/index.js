const User = require('../models/signup')
const sequelize = require('../util/database')
const Messages = require('../models/messages')
const Groups = require('../models/group')
const { Op } = require('sequelize');

exports.postAddMessage = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const name = req.user.username;
        const messages = req.body.messageContent;
        const time = req.body.time;
        const userId = req.user.id;
        const groupId = req.body.groupId;

        const message = await Messages.create(
            {
                name: name,
                message: messages,
                time: time,
                userId: userId,
                groupId: groupId
            },
            { transaction: t }
        );

        await t.commit();

        res.status(201).json({ newMessageDetails: message });
        console.log('Message added to server');
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.postAddGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const groupname = req.body.groupname;
        const userId = req.user.id;

        const group = await Groups.create(
            {
                groupName: groupname,
                // userId: userId // This line will not be necessary for the many-to-many association
            },
            { transaction: t }
        );

        // Associating the current user with the group
        await group.addUser(userId, { transaction: t });

        await t.commit();

        res.status(201).json({ newGroupDetails: group });
        console.log('Group added to server');
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.getAllMessages = async (req, res, next) => {
    try {
        const allMessages = await Messages.findAll();
        
        res.status(200).json({ messages: allMessages });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.getAllGroups = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetching groups that the user belongs to
        const groups = await Groups.findAll({
            include: [{ 
                model: User, 
                where: { id: userId } 
            }]
        });

        res.status(200).json({ groups: groups });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.getMessagesForGroup = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const messages = await Messages.findAll({
            where: { groupId: groupId }
        });
        res.status(200).json({ messages: messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.getNewMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.lastMessageId || -1; // Getting the last message ID from the query parameter

        // Fetching only the new messages with IDs greater than the last message ID
        const newMessages = await Messages.findAll({
            where: {
                id: {
                    [Op.gt]: lastMessageId // Fetching messages with IDs greater than the last message ID
                }
            }
        });

        res.status(200).json({ messages: newMessages });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.getUsersForGroup = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const group = await Groups.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        const users = await group.getUsers();
        res.status(200).json({ users: users });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.addUserToGroup = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.body.userId;
        
        const group = await Groups.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Checking if the user already belongs to the group
        const existingUser = await group.getUsers({ where: { id: userId }});
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already belongs to the group" });
        }

        // Adding user to the group
        await group.addUser(userId);

        res.status(201).json({ message: "User added to the group successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ users: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

