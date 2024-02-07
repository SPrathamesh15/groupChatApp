const User = require('../models/signup');
const bcrypt = require('bcrypt')

exports.postAddUser = async (req, res, next) => {
    try {
      const username = req.body.username;
      const useremail = req.body.useremail;
      const userpassword = req.body.userpassword;
      const usernumber = req.body.usernumber;
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userpassword, saltRounds)
      const existingUser = await User.findOne({ where: { useremail: useremail } });
      if (existingUser) {
        console.log('user exists!')
        return res.status(400).json({ error: 'User already exists' });
        
      }
      const data = await User.create({
        username: username,
        useremail: useremail,
        usernumber: usernumber,
        userpassword: hashedPassword,
      });

      console.log('Sign Up data: ', data)
      res.status(201).json({ newUserDetails: data });
      console.log('Added to server');
    } catch (err) {
      console.error('Error in postAddProduct:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };