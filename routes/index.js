const express = require('express');
const messageController = require('../controllers/index');
const userAuthentication = require('../middleware/auth')
const router = express.Router();

router.post('/add-message', userAuthentication.Authenticate, messageController.postAddMessage);

module.exports = router;