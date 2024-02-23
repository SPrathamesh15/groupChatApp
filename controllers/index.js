const User = require('../models/signup')
const sequelize = require('../util/database')
const Messages = require('../models/messages')
const Groups = require('../models/group')
const UserGroup = require('../models/usergroup')
const { Op } = require('sequelize');
const S3Services = require('../services/s3services')
const AWS = require('aws-sdk')
const dotenv = require('dotenv')
dotenv.config()

const io = require('socket.io')(8000, {
    cors: {
        origin: ['http://localhost:3000']
    }
})

const jwt = require('jsonwebtoken');
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
    return next(new Error('Authentication token is missing'));
    }

    try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    const userId = decoded.userId;

    // Fetching user details from the database
    User.findByPk(userId)
        .then(user => {
        if (!user) {
            return next(new Error('User not found'));
        }
        // Attaching user details to the socket object for future use
        socket.user = {
            userId: user.id,
            username: user.username
        };
        next();
        })
        .catch(err => {
        console.error('Error fetching user:', err);
        next(err);
        });
    } catch (err) {
    console.error('Error verifying token:', err);
    next(new Error('Invalid authentication token'));
    }
});

io.on('connection', async(socket) => {
    console.log("socket ID: ", socket.id)
    socket.on('selected-group', async (groupId) => {
        
        try {
            const messages = await Messages.findAll({
                where: { groupId: groupId }
            });
            socket.emit("group-messages", messages);
            const fileURLs = await fetchFileURLsFromS3();
            console.log('fileURL: ', fileURLs)
            const { username } = socket.user;
        socket.emit('previous-images', {fileURL: fileURLs, userName:username})
        } catch (err) {
            console.error(err);
        }
    });
    // socket.on('previous-images', async () => {
    //     try {
    //         const fileURLs = await fetchFileURLsFromS3();
    //         socket.emit('previous-images', fileURLs);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // });        
    socket.on('send-image', async (data) => {
        try {
            const fileData = data.fileData;
            const fileName = data.fileName;
            
            // Call the function to upload the file to Amazon S3
            const fileURL = await S3Services.uploadToS3(fileData, fileName);
    
            // Emit an event to notify clients about the uploaded file URL
            // io.emit('file-uploaded', { fileURL, fileName });
            
        } catch (error) {
            console.error('Error uploading file:', error);
        }
        const { username } = socket.user;
        io.emit('image-message', { imageData: data.imageData, fileName: data.fileName, userName: username, time: data.currentTime });

        
    });
    
    socket.on('send-message', async (message) => {
        try {
            // Saving the message to the database
            const { userId, username } = socket.user;
            const savedMessage = await postAddMessage(message, username, userId);
            io.emit("recieve-message", {message, username});
        } catch (err) {
            console.error(err);
        }
        
    });
})

// Function to fetch file URLs from S3
async function fetchFileURLsFromS3() {
try {
    // Perform logic to list files in your S3 bucket and generate file URLs
    // For example:
    const bucketParams = {
        Bucket: process.env.BUCKET_NAME, // Update with your S3 bucket name
        MaxKeys: 10 // Adjust as needed
    };
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    const s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    });
    const data = await s3bucket.listObjectsV2(bucketParams).promise();

    const fileURLs = data.Contents.map(file => {
        return {
            fileName: file.Key,
            fileURL: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${file.Key}`,
            timestamp: file.LastModified
        };
    });

    return fileURLs;
} catch (error) {
    console.error('Error fetching file URLs from S3:', error);
    throw error;
}
}
async function postAddMessage(socketMessage,username,UserId) {
    const t = await sequelize.transaction();
    try {
        const name = username;
        const messages = socketMessage.messageContent;
        const time = socketMessage.currentTime;
        const userId = UserId;
        const groupId = socketMessage.groupId;

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

        // res.status(201).json({ newMessageDetails: message });
        console.log('Message added to server');
    } catch (err) {
        await t.rollback();
        // res.status(500).json({ error: err.message });
        console.error(err);
    }
};
module.exports.postAddMessage = postAddMessage;

exports.postAddGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const groupname = req.body.groupname;
        const userId = req.user.id;
        const isAdmin = true; // Setting the creator of the group as admin

        const group = await Groups.create(
            {
                groupName: groupname,
            },
            { transaction: t }
        );

        // Associating the current user with the group
        await group.addGroupUser(userId, { through: { isAdmin: isAdmin }, transaction: t });

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
                as: 'GroupUsers', // Specifying the alias here
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
        const users = await group.getGroupUsers(); 
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
        const currentUserId = req.user.id
        const group = await Groups.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Checking if the user already belongs to the group
        const existingUser = await group.getGroupUsers({ where: { id: userId }});
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already belongs to the group" });
        }

        // Checking if the authenticated user is an admin of the group
        const isAdmin = await checkAdminStatus(groupId, currentUserId);
        console.log(isAdmin)
        if (!isAdmin) {
            return res.status(403).json({ error: "You are not authorized to perform this action" });
        }
        // Adding user to the group
        await group.addGroupUser(userId);

        res.status(201).json({ message: "User added to the group successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

async function checkAdminStatus(groupId, userId) {
    try {
        const group = await Groups.findByPk(groupId);
        if (!group) {
            throw new Error("Group not found");
        }
        console.log(groupId, userId)
        // Checking if the user is an admin of the group
        const userGroup = await UserGroup.findOne({
            where: {
                groupId: groupId,
                userId: userId,
                isAdmin: true
            }
        });
        console.log(userGroup)
        return !!userGroup; // Returning true if the user is an admin, false otherwise
    } catch (err) {
        console.error("Error checking admin status:", err);
        return false; // Returning false in case of any error
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ users: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.makeUserAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const selectedUserId = req.params.userId;
        const currentUserId = req.user.id
        // Updating UserGroup entry to mark the user as admin
        const userGroup = await UserGroup.findOne({
            where: {
                groupId: groupId,
                userId: selectedUserId
            }
        });

        // Checking if the authenticated user is an admin of the group
        const isAdmin = await checkAdminStatus(groupId, currentUserId);
        if (!isAdmin) {
            return res.status(403).json({ error: "You are not authorized to perform this action" });
        }

        userGroup.isAdmin = true;
        await userGroup.save();

        res.status(200).json({ message: "User is now an admin" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

exports.removeUserFromGroup = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.params.userId;
        const currentUserId = req.user.id
        console.log('remove;',userId)
        // Checking if the authenticated user is an admin of the group
        const isAdmin = await checkAdminStatus(groupId, currentUserId);
        if (!isAdmin) {
            return res.status(403).json({ error: "You are not authorized to perform this action" });
        }

        // Removing UserGroup entry to remove the user from the group
        await UserGroup.destroy({
            where: {
                groupId: groupId,
                userId: userId
            }
        });

        res.status(200).json({ message: "User removed from group" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

