const express = require('express');
const messageController = require('../controllers/index');
const userAuthentication = require('../middleware/auth')
const router = express.Router();

router.post('/add-message', userAuthentication.Authenticate, messageController.postAddMessage);
router.get('/all-messages', userAuthentication.Authenticate, messageController.getAllMessages);

module.exports = router;