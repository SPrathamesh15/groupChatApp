const path = require('path');
const express = require('express');
const userController = require('../controllers/signup');
const router = express.Router();

router.post('/add-user', userController.postAddUser);

module.exports = router;
