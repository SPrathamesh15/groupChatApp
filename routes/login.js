const path = require('path');
const express = require('express');
const userController = require('../controllers/login');
const router = express.Router();

router.post('/login-user', userController.postLogInUser);

module.exports = router;
