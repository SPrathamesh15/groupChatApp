const express = require('express');
const messageController = require('../controllers/index');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

router.post('/add-message', userAuthentication.Authenticate, messageController.postAddMessage);
router.get('/all-messages', userAuthentication.Authenticate, messageController.getAllMessages);
router.get('/get-new-messages', userAuthentication.Authenticate, messageController.getNewMessages);
router.post('/add-group', userAuthentication.Authenticate, messageController.postAddGroup);

// Route to fetch all groups
router.get('/all-groups', userAuthentication.Authenticate, messageController.getAllGroups);

// Route to fetch messages for a specific group
router.get('/group/:groupId', userAuthentication.Authenticate, messageController.getMessagesForGroup);

// Route to fetch users for a specific group
router.get('/:groupId/users', messageController.getUsersForGroup);

// Route to add a user to a group
router.post('/:groupId/users', userAuthentication.Authenticate, messageController.addUserToGroup);

router.get('/all-users', messageController.getAllUsers);

// Route to make a user admin
router.post('/:groupId/users/:userId/make-admin', userAuthentication.Authenticate, messageController.makeUserAdmin);

// Route to remove a user from the group
router.delete('/:groupId/users/:userId', userAuthentication.Authenticate, messageController.removeUserFromGroup);

module.exports = router;
